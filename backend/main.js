const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const OTPAuth = require('otpauth');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Vite React port is usually 5173
app.use(express.json());
app.use(cookieParser()); 

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." }
});

// ==========================================
// 2. DATABASE CONNECTION & SCHEMAS
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connection established successfully!"))
  .catch((err) => console.error("Database connection failed:", err));

// --- USER SCHEMA (For Login/Auth) ---
const secureUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otpSecret: { type: String },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
});
const User = mongoose.model('UltimateSecureUser', secureUserSchema);

// --- CUSTOMER SCHEMA (For CRM Data) ---
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UltimateSecureUser' }
}, { timestamps: true });
const Customer = mongoose.model('Customer', customerSchema);

// ==========================================
// 3. NODEMAILER & AUTH MIDDLEWARE
// ==========================================
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, 
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const authorizeUser = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ success: false, message: "Access Denied: Session Token Missing" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Authentication Failed: Token Expired" });
  }
};

// ==========================================
// 4. AUTHENTICATION ROUTES (Register & Login)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already registered" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login-step1', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ success: false, message: "Account locked temporarily." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 3) {
        user.lockUntil = Date.now() + 2 * 60 * 1000; 
        user.failedAttempts = 0; 
      }
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    user.failedAttempts = 0;
    user.lockUntil = undefined;
    if (!user.otpSecret) user.otpSecret = new OTPAuth.Secret({ size: 20 }).base32;
    await user.save();

    let totp = new OTPAuth.TOTP({ issuer: "MernCRM", label: user.email, algorithm: "SHA1", digits: 6, period: 300, secret: user.otpSecret });
    const generatedOTP = totp.generate();

    await transporter.sendMail({
      from: '"CRM Security" <security@crm.com>',
      to: user.email,
      subject: "Your 2FA Login Code",
      text: `Your 6-digit code is: ${generatedOTP}. It expires in 5 minutes.`
    });

    res.status(200).json({ success: true, message: "Step 1 complete. Check Ethereal Mail for OTP.", email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login-step2', async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid user" });

    let totp = new OTPAuth.TOTP({ issuer: "MernCRM", label: user.email, algorithm: "SHA1", digits: 6, period: 300, secret: user.otpSecret });
    let delta = totp.validate({ token: otpCode, window: 1 });
    if (delta === null) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', sessionToken, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.status(200).json({ success: true, message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. CRM CRUD ROUTES (Customer Management)
// ==========================================
app.post('/api/customers', authorizeUser, async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    const newCustomer = new Customer({ name, email, phone, company, createdBy: req.user.userId });
    await newCustomer.save();
    res.status(201).json({ success: true, customer: newCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/customers', authorizeUser, async (req, res) => {
  try {
    const customers = await Customer.find({ createdBy: req.user.userId });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// UPDATE: Edit customer details
app.put('/api/customers/:id', authorizeUser, async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId }, 
      req.body, 
      // old method:
      // { new: true } 
      //new method
      { returnDocument: 'after' }
    );
    if (!updatedCustomer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.status(200).json({ success: true, customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/customers/:id', authorizeUser, async (req, res) => {
  try {
    await Customer.findOneAndDelete({ _id: req.params.id, createdBy: req.user.userId });
    res.status(200).json({ success: true, message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
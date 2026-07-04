# 🚀 Enhancing CRM Solutions with MERN Integration

A robust and highly secure Customer Relationship Management (CRM) application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). This project implements advanced user authentication mechanisms and full CRUD functionality to manage customer data effectively.

## ✨ Key Features

### 🔐 Advanced Security & Authentication
- **Two-Factor Authentication (2FA):** OTP-based login sent via email (using Nodemailer & Ethereal).
- **Session Management:** Secure authentication using **JWT** stored in **HttpOnly Cookies**.
- **Brute Force Protection:** Account lockout mechanism after 3 failed login attempts.
- **Rate Limiting:** Restricts multiple login API hits from the same IP address.
- **Password Encryption:** Passwords are cryptographically hashed using `bcryptjs`.

### 👥 CRM Data Management (CRUD)
- **Create:** Add new customer details (Name, Email, Phone, Company).
- **Read:** View a tabulated list of all registered customers.
- **Update:** Edit and update existing customer information.
- **Delete:** Remove a customer record securely.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), Axios, React Router Dom
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Security:** JsonWebToken (JWT), Bcrypt.js, Cookie-Parser, Express-Rate-Limit, OTPAuth

## 📂 Project Structure

```text
📦 CRM-MERN-App
 ┣ 📂 backend
 ┃ ┣ 📜 .env
 ┃ ┣ 📜 main.js
 ┃ ┣ 📜 package.json
 ┃ ┗ 📜 package-lock.json
 ┗ 📂 frontend
   ┣ 📂 src
   ┃ ┣ 📂 components
   ┃ ┃ ┣ 📜 Login.jsx
   ┃ ┃ ┗ 📜 Dashboard.jsx
   ┃ ┣ 📜 App.jsx
   ┃ ┗ 📜 main.jsx
   ┣ 📜 package.json
   ┗ 📜 vite.config.js

```

## ⚙️ Installation & Setup Guide

### 1. Prerequisites

Ensure you have the following installed on your local machine:

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas)
* An account on [Ethereal Mail](https://ethereal.email/) (for testing 2FA emails)

### 2. Clone the Repository

```bash
git clone https://github.com/gunasekaran006-alt/Assignment14-Enhancing-CRM-Solutions-with-MERN-Integration.git

cd YOUR_REPOSITORY_NAME

```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install

```

Create a `.env` file in the `backend` folder and configure the following variables:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_ethereal_email@ethereal.email
EMAIL_PASS=your_ethereal_password

```

Start the backend server:

```bash
npm run dev

```

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install

```

Start the React application:

```bash
npm run dev

```

## 💻 Usage Instructions

1. Open your browser and navigate to `http://localhost:5173`.
2. **Register** a new account.
3. **Login** using your credentials.
4. Check your [Ethereal Mail](https://ethereal.email/messages) inbox for the **6-digit OTP**.
5. Enter the OTP to access the CRM Dashboard.
6. Start managing your customers by adding, editing, or deleting records!

## 📜 License

This project was created for educational purposes and assignment submission.

```
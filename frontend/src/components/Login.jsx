import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', { email, password });
      setMessage(res.data.message + " Now please Login.");
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login-step1', { email, password });
      setMessage(res.data.message);
      setStep(2); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/login-step2', { email, otpCode });
      navigate('/dashboard'); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h2>CRM Secure Login</h2>
      <p style={{ color: 'blue' }}>{message}</p>
      
      {step === 1 ? (
        <form>
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/><br/>
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/><br/>
          <button onClick={handleStep1} style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}>Login</button>
          <button onClick={handleRegister} style={{ padding: '10px 20px', cursor: 'pointer' }}>Register</button>
        </form>
      ) : (
        <form onSubmit={handleStep2}>
          <p>Check Ethereal Mail for your 6-digit OTP</p>
          <input type="text" placeholder="6-digit OTP" required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/><br/>
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Verify OTP & Enter</button>
        </form>
      )}
    </div>
  );
};

export default Login;
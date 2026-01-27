const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login endpoint (dummy authentication)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Dummy authentication - accepts any username/password
  if (username && password) {
    // Generate a dummy token
    const token = `dummy_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    res.json({
      success: true,
      token: token,
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth Service running on port ${PORT}`);
});

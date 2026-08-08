require('dotenv').config();
const mongoose = require('mongoose');
const authController = require('./src/controllers/authController');
const express = require('express');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const req = {
      body: {
        email: 'mhdfaizalofficial@gmail.com',
        password: 'somepassword',
        portal: 'user'
      }
    };
    const res = {
      status: (code) => {
        console.log('Status:', code);
        return {
          json: (data) => console.log('JSON:', data)
        };
      }
    };

    await authController.login(req, res);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();

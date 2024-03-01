const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');

// Import models
const User = require('./models/user');
const Food = require('./models/food');
const Order = require('./models/order');

const app = express();

// Middleware
app.use(bodyParser.json());

// Express session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Passport Google OAuth2.0 strategy setup
passport.use(new GoogleStrategy({
  clientID: 'shreyak.cy21@sahyadri.edu.in',
  clientSecret: 'Ugetlost5',
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'user'
      });
      await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect to the dashboard or home page
  res.redirect('/');
});

// User registration route
app.post('/register', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = new User({ name, email, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to fetch food items with filters
app.get('/foods', async (req, res) => {
  try {
    const { category } = req.query;
    let foods;
    if (category) {
      foods = await Food.find({ category });
    } else {
      foods = await Food.find();
    }
    res.json({ message: 'Food items', foods });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const searchResults = await Food.find({ name: { $regex: query, $options: 'i' } });
    res.json({ message: 'Search results', results: searchResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to place an order
app.post('/orders', async (req, res) => {
  try {
    const { foodId, userId, addressId, paymentMode } = req.body;
    const order = new Order({ foodId, userId, addressId, paymentMode });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

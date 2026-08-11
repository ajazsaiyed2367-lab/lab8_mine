require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const Submission = require('./models/Submission');
const Admin = require('./models/Admin');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// ---- Session middleware (must come before routes) ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'lab8-dev-secret-change-me',
  resave: false,
  saveUninitialized: false
}));

// Make session/admin info available to every EJS view without
// repeating it in every route.
app.use((req, res, next) => {
  res.locals.isAdmin = req.session.isAdmin === true;
  res.locals.adminName = req.session.adminName || null;
  next();
});

// Middleware to protect admin-only routes
function isAuthenticated(req, res, next) {
  if (req.session.isAdmin === true) {
    return next();
  }
  return res.redirect('/login');
}

// ---- MongoDB connection ----
// Put your real connection string in a .env file locally, and in
// Vercel's Environment Variables when you deploy. Never commit
// your real connection string to GitHub.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab7';

// On serverless platforms (like Vercel) each request can hit a fresh
// function instance, so we cache the connection promise instead of
// calling mongoose.connect() again on every cold start, and we wait
// for it to finish before handling the request. Without this, a route
// can run before the connection is ready and Mongoose queries time out
// with "buffering timed out" errors.
let dbConnection = null;
function connectDB() {
  if (!dbConnection) {
    dbConnection = mongoose.connect(MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        dbConnection = null; // allow retry on the next request
        throw err;
      });
  }
  return dbConnection;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).send('Database connection failed. Please try again shortly.');
  }
});

// Same regex patterns carried over from Lab 6 / Lab 5
const postcodeRegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;
const phoneRegex = /^\(?(\d{3})\)?[\.\-\/\s]?(\d{3})[\.\-\/\s]?(\d{4})$/;
app.get('/', (req, res) => {
  res.render('form', {
    errors: [],
    values: {},
    result: null
  });
});

app.post(
  '/processForm',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('lunch').notEmpty().withMessage('You did not select any value for lunch'),
    body('campus').notEmpty().withMessage('Campus must be selected'),
    body('postcode')
      .trim()
      .toUpperCase()
      .matches(postcodeRegex)
      .withMessage('Post code is not in correct format'),
    body('phone')
      .trim()
      .matches(phoneRegex)
      .withMessage('Phone is not in correct format'),

    // --- Lab 7 custom validation ---
    body('tickets')
      .notEmpty().withMessage('Number of tickets must be selected')
      .bail()
      .isNumeric().withMessage('Tickets must be a valid number')
      .bail()
      .custom((value) => {
        if (Number(value) <= 0) {
          throw new Error('Tickets must be a valid number');
        }
        return true;
      }),
    body('lunch').custom((value, { req }) => {
      if (value === 'yes' && Number(req.body.tickets) < 3) {
        throw new Error('Lunch can only be purchased when buying 3 or more tickets.');
      }
      return true;
    })
  ],
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.render('form', {
        errors: result.array(),
        values: req.body,
        result: null
      });
    }

    const tickets = parseInt(req.body.tickets, 10);
    let subtotal = 0;

    if (tickets > 0) {
      subtotal = 100 * tickets;
    }
    if (req.body.lunch === 'yes') {
      subtotal += 60;
    }

    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    try {
      // Save the valid submission to MongoDB
      await Submission.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        postcode: req.body.postcode,
        campus: req.body.campus,
        tickets: tickets,
        lunch: req.body.lunch,
        subtotal: subtotal,
        tax: tax,
        total: total
      });
    } catch (err) {
      console.error('Error saving submission:', err);
      return res.render('form', {
        errors: [{ msg: 'Something went wrong saving your submission. Please try again.' }],
        values: req.body,
        result: null
      });
    }

    res.render('form', {
      errors: [],
      values: req.body,
      result: {
        name: req.body.name,
        email: req.body.email,
        lunch: req.body.lunch,
        campus: req.body.campus,
        cost: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      }
    });
  }
);

// All Orders page — admins only
app.get('/submissions', isAuthenticated, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.render('submissions', { submissions: submissions, error: null });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.render('submissions', { submissions: [], error: 'Could not load submissions.' });
  }
});

// ---- Admin login ----
app.get('/login', (req, res) => {
  res.render('login', { error: null, values: {} });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username: username });

    if (!admin || admin.password !== password) {
      return res.render('login', {
        error: 'Incorrect username or password.',
        values: { username: username }
      });
    }

    req.session.isAdmin = true;
    req.session.adminName = admin.displayName;

    res.redirect('/submissions');
  } catch (err) {
    console.error('Error during login:', err);
    res.render('login', {
      error: 'Something went wrong. Please try again.',
      values: { username: username }
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(8080);
console.log("Web Server Started and Listening on port number 8080");

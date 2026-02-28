require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');

const authRoutes = require('./src/routes/auth');
const tasksRoutes = require('./src/routes/tasks');
const attachmentsRoutes = require('./src/routes/attachments');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure EJS as the view engine
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Serve static files (like Bootstrap CSS if downloaded locally)
// If using a CDN, this is not strictly necessary for Bootstrap itself
app.use(express.static(path.join(__dirname, 'public')));

// Upload task file
app.use('/images', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'images')));

// Default route
app.get('/', (req, res) => {
    res.render('index'); // Renders views/index.ejs
});

// Admin route
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Register
app.get('/register', (req, res) => {
    res.render('register');
});

// Login
app.get('/login', (req, res) => {
    res.render('login');
});

// Create task
app.get('/create_task', (req, res) => {
    res.render('create_task');
});


// User and Tasks routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;

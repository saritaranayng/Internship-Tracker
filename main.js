require('dotenv').config();
const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const homeRoutes = require('./routes/homeRoutes');
const path = require('path');
const connectDB = require("./config/db");
const session = require('express-session');

connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

app.set('view engine', 'ejs');

app.use('/', homeRoutes);
app.use('/student', studentRoutes);
app.use('/faculty', facultyRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

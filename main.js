require('dotenv').config();
const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const homeRoutes = require('./routes/homeRoutes');
const path = require('path');
const connectDB = require("./config/db");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const os = require('os');

connectDB();

app.use(express.static(path.join(__dirname, 'public')));
// Serve uploads from the OS temp directory (Vercel allows writing to /tmp)
app.use('/uploads', express.static(path.join(os.tmpdir(), 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false, // Changed to false to prevent empty sessions
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internDB'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/', homeRoutes);
app.use('/student', studentRoutes);
app.use('/faculty', facultyRoutes);

// Global Error Handler (so we can see 500 errors instead of crashing)
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(500).send(`<h1>500 Internal Server Error</h1><p>${err.message}</p>`);
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

module.exports = app;

const express = require('express');
const router = express.Router();
const facultydetails = require("../controllers/facultyController");
const { isFacultyLoggedIn } = require('../middleware/auth');

// Public routes
router.get('/signup', facultydetails.facultysignuppage);
router.post('/signup', facultydetails.signupform);
router.get('/login', facultydetails.facultyloginpage);
router.post('/login', facultydetails.Floginform);

// Protected routes
router.get('/dashboard', isFacultyLoggedIn, facultydetails.facultydashboard);
router.post('/logout', facultydetails.facultyLogout);

// Approve/Reject Logs
router.post('/approve/:id', isFacultyLoggedIn, facultydetails.approveLog);
router.post('/reject/:id', isFacultyLoggedIn, facultydetails.rejectLog);
router.post('/changepassword', isFacultyLoggedIn, facultydetails.changePassword);

module.exports = router;

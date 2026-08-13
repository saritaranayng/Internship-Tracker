const express = require('express');
const router = express.Router();
const facultydetails = require("../controllers/facultyController");
const { isFacultyLoggedIn } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/signup', facultydetails.facultysignuppage);
router.post('/signup', facultydetails.signupform);
router.get('/login', facultydetails.facultyloginpage);
router.post('/login', facultydetails.Floginform);

// Protected routes
router.get('/dashboard', isFacultyLoggedIn, facultydetails.facultydashboard);
router.post('/logout', facultydetails.facultyLogout);

// Approve/Request Changes for Weekly Summaries
router.post('/approve/:id', isFacultyLoggedIn, facultydetails.approveSummary);
router.post('/request-changes/:id', isFacultyLoggedIn, facultydetails.requestChangesSummary);
router.post('/changepassword', isFacultyLoggedIn, facultydetails.changePassword);
router.post('/updateprofile', isFacultyLoggedIn, upload.single('profilePicture'), facultydetails.updateProfile);

module.exports = router;

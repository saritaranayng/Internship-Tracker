const express = require('express');
const router = express.Router();
const studentdetails = require("../controllers/studentController");
const { isStudentLoggedIn } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/signup', studentdetails.Studentsignuppage);
router.post('/signup', studentdetails.signupform);
router.get('/login', studentdetails.Studentloginpage);
router.post('/login', studentdetails.loginform);

// Protected routes
router.get('/dashboard', isStudentLoggedIn, studentdetails.studentdashboard);
router.post('/submitlog', isStudentLoggedIn, upload.single('logFile'), studentdetails.submitLog);
router.get('/logout', studentdetails.logout);

// Log Management
router.get('/viewlog/:id', isStudentLoggedIn, studentdetails.getViewLogPage);
router.get('/editlog/:id', isStudentLoggedIn, studentdetails.getEditLogPage);
router.post('/editlog/:id', isStudentLoggedIn, upload.single('file'), studentdetails.postEditLog);
router.post('/deletelog/:id', isStudentLoggedIn, studentdetails.deleteLog);
router.post('/changepassword', isStudentLoggedIn, studentdetails.changePassword);
router.post('/updateprofile', isStudentLoggedIn, upload.single('profilePicture'), studentdetails.updateProfile);
router.post('/updatepreferences', isStudentLoggedIn, studentdetails.updatePreferences);
router.post('/deleteaccount', isStudentLoggedIn, studentdetails.deleteAccount);
router.post('/deactivate', isStudentLoggedIn, studentdetails.deactivateAccount);

module.exports = router;

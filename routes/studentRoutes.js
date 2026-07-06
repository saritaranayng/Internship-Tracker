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
router.get('/logout', studentdetails.logout);
router.post('/submit-task', isStudentLoggedIn, upload.single('taskFile'), studentdetails.submitTask);
router.post('/edit-task/:id', isStudentLoggedIn, upload.single('taskFile'), studentdetails.editTask);
router.post('/delete-task/:id', isStudentLoggedIn, studentdetails.deleteTask);
router.post('/submit-summary', isStudentLoggedIn, studentdetails.submitSummary);
router.post('/edit-summary/:id', isStudentLoggedIn, studentdetails.editSummary);
router.get('/final-report', isStudentLoggedIn, studentdetails.getFinalReport);
router.post('/changepassword', isStudentLoggedIn, studentdetails.changePassword);
router.post('/updateprofile', isStudentLoggedIn, upload.single('profilePicture'), studentdetails.updateProfile);
router.post('/updatepreferences', isStudentLoggedIn, studentdetails.updatePreferences);
router.post('/deleteaccount', isStudentLoggedIn, studentdetails.deleteAccount);
router.post('/deactivate', isStudentLoggedIn, studentdetails.deactivateAccount);
router.post('/internship-details', isStudentLoggedIn, upload.single('offerLetter'), studentdetails.updateInternshipDetails);

module.exports = router;

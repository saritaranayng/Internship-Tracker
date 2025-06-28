//<=============================REQUIRED MODULES========================================>

const express = require("express");
const router = express.Router();

const multer = require('multer'); // For file uploads
const studentdetails = require("../controllers/studentController");
const facultydetails = require("../controllers/facultyController");
const homedetails=require('../controllers/homeController')
const isStudentLoggedIn = require('../middleware/auth');
const upload = require('../middleware/upload'); 
//<======================PUBLIC ROUTES=====================================================>
router.get('/', studentdetails.getHomepage);
router.get('/terms', studentdetails.terms);
router.get('/terms2', facultydetails.terms);
//<====================================STUDENT PUBLIC ROUTES (NO LOGIN REQUIRED)============>
router.get('/Ssignup', studentdetails.Studentsignuppage);     // Show signup form
router.post('/signup', studentdetails.signupform);            // Handle signup

router.get('/Slogin', studentdetails.Studentloginpage);       // Show login form
router.post('/Slogin', studentdetails.loginform);             // Handle login

//<==================================STUDENT PROTECTED ROUTES(LOGIN REQUIRED)===============>
router.get('/student/dashboard', isStudentLoggedIn, studentdetails.studentdashboard); // Dashboard

// Submit Log (with file upload)
router.post('/student/submitlog', isStudentLoggedIn, upload.single('logFile'), studentdetails.submitLog);

// Logout student
router.get('/student/logout', studentdetails.logout);

//<=================================LOG MANAGEMENT (EDIT/DELETE LOGS)========================================>
router.get('/student/editlog/:id', isStudentLoggedIn, studentdetails.getEditLogPage); // Show edit form

router.post('/student/editlog/:id', isStudentLoggedIn, upload.single('file'), studentdetails.postEditLog); // Handle edit

router.post('/student/deletelog/:id', isStudentLoggedIn, studentdetails.deleteLog); // Handle delete


//<=====================================FACULTY PUBLIC ROUTES================================>
router.get('/Fsignup', facultydetails.facultysignuppage);     // Faculty signup form
router.post('/signupf', facultydetails.signupform);           // Handle faculty signup

router.get('/Flogin', facultydetails.facultyloginpage);       // Faculty login form
router.post('/Flogin', facultydetails.Floginform);            // Handle login

//<======================================FACULTY PROTECTED ROUTE===============================>
router.get('/faculty/dashboard', facultydetails.facultydashboard); // Faculty dashboard

router.post('/faculty/logout', facultydetails.facultyLogout);

//<=============================APPROVE/REJECT LOGS============================================>
router.post('/faculty/approve/:id', facultydetails.approveLog); // Approve log
router.post('/faculty/reject/:id', facultydetails.rejectLog);   // Reject log



//<=================================ROUTES FOR home page button clicks=========================>
router.get('/internships', homedetails.viewInternships);
router.get('/jobs', homedetails.viewJobs);
router.get('/courses', homedetails.viewCourses);
router.get('/certifications', homedetails.viewCertifications);

module.exports=router;






























// const express=require("express");
// const router=express.Router();
// const studentdetails=require("../controllers/studentController");
// const facultydetails=require("../controllers/facultyController");
// const isStudentLoggedIn = require('../middleware/auth');
// const upload = require('../middleware/upload')
// const multer = require('multer');


// router.get('/',studentdetails.getHomepage)
// router.get('/terms',studentdetails.terms)


// //<================STUDENT ROUTES======================>

// //<===========================PUBLIC ROUTES============================>
// router.get('/Ssignup',studentdetails.Studentsignuppage);
// router.post('/signup',studentdetails.signupform);
// router.get('/Slogin',studentdetails.Studentloginpage);
// router.post('/Slogin',studentdetails.loginform);
// //router.get('/student/dashboard',studentdetails.studentdashboard)

// //<+===========PROTECTED ROUTES===================================>
// router.get('/student/dashboard', isStudentLoggedIn, studentdetails.studentdashboard);
// // Storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// router.post('/student/submitlog', isStudentLoggedIn, upload.single('logFile'),studentdetails.submitLog);
// router.get('/student/logout',studentdetails.logout);


// // function checkStudentSession(req, res, next) {
// //     if (!req.session.rollno || !req.session.email) {
// //         return res.redirect('/login');
// //     }
// //     next();
// // }

// // router.get('/dashboard', checkStudentSession, controller.studentdashboard);
// // router.post('/submitlog', checkStudentSession, controller.submitlog);
// // router.get('/logout', controller.logout);


// // Edit Log - GET form
// router.get('/student/editlog/:id', studentdetails.getEditLogPage);

// // Edit Log - POST form submission




// router.post('/student/editlog/:id', upload.single('file'), studentdetails.postEditLog);
// //router.post('/student/editlog/:id', studentdetails.postEditLog);

// // Delete Log - POST (form submission)
// router.post('/student/deletelog/:id', studentdetails.deleteLog);









// //<================FACULTY ROUTES=========================>



// router.get('/Fsignup',facultydetails.facultysignuppage);
// router.get('/terms2',facultydetails.terms)
// router.post('/signupf',facultydetails.signupform);
// router.get('/Flogin',facultydetails.facultyloginpage)
// router.post('/Flogin',facultydetails.Floginform)
// router.get('/faculty/dashboard',facultydetails.facultydashboard);


// // Approve and Reject Log Routes (Faculty)
// router.post('/faculty/approve/:id', facultydetails.approveLog);
// router.post('/faculty/reject/:id', facultydetails.rejectLog);


// module.exports=router;
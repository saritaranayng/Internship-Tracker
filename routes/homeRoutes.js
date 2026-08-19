const express = require('express');
const router = express.Router();
const studentdetails = require("../controllers/studentController");
const facultydetails = require("../controllers/facultyController");
const homedetails = require('../controllers/homeController');

router.get('/', studentdetails.getHomepage);
router.get('/terms', studentdetails.terms);
router.get('/terms2', facultydetails.terms);

router.get('/internships', homedetails.viewInternships);
router.get('/jobs', homedetails.viewJobs);
router.get('/courses', homedetails.viewCourses);
router.get('/certifications', homedetails.viewCertifications);

router.get('/about', homedetails.aboutUs);
router.get('/contact', homedetails.contactUs);
router.get('/privacy', homedetails.privacyPolicy);

module.exports = router;

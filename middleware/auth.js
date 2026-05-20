function isStudentLoggedIn(req, res, next) {
    if (!req.session.rollno || !req.session.email) {
        return res.redirect('/student/login'); // Updated to new path
    }
    next();
}

function isFacultyLoggedIn(req, res, next) {
    if (!req.session.email) {
        return res.redirect('/faculty/login'); // Updated to new path
    }
    next();
}

module.exports = { isStudentLoggedIn, isFacultyLoggedIn };


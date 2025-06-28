function isStudentLoggedIn(req, res, next) {
    if (!req.session.rollno || !req.session.email) {
        return res.redirect('/Slogin');  // Agar session nahi hai to login page bhej do
    }
    next();  // Agar session hai to aage badho
}

module.exports = isStudentLoggedIn;


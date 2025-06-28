const{faculty}=require("../models/facultySchema");
const bcrypt = require('bcrypt');
const { student } = require('../models/studentSchema');
const { Log } = require('../models/log');

//<================================RENDERING OF PAGES==============================>
exports.facultysignuppage=(req,res)=>
{
   res.render('Facultysignup',{message:""});
}

exports.facultyloginpage=(req,res)=>
{
   res.render('Flogin',{message:""});
}


exports.terms=(req,res)=>{
    res.render('terms2')
}




exports.signupform = async (req, res) => {
    const { firstname, lastname, email, password, department, designation } = req.body;

    if (!firstname || !lastname || !email || !password || !department || !designation) {
        return res.render('Facultysignup', { message: "All fields are required" });
    }

    try {
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10 (recommended)

        const newfaculty = new faculty({
            firstname,
            lastname,
            email,
            password: hashedPassword, // Store hashed password
            department,
            designation
        });

        await newfaculty.save();
        return res.render('Flogin',{ message: "Faculty signed up successfully" });
    } catch (err) {
        console.log("Error in signup:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.Floginform = async (req, res) => {
    const { department, email, password } = req.body;


    try {
        const staff = await faculty.findOne({ department, email });

        if (!staff) {
            return res.status(404).render('Flogin', { message: "Invalid credentials" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).render('Flogin', { message: "Invalid credentials" });
        }

        req.session.email = staff.email;

        return res.redirect('/faculty/dashboard');

    } catch (err) {
        console.error("Error in login:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};




exports.facultydashboard = async (req, res) => {
    if (!req.session.email) {
        return res.redirect('/Flogin');
    }

    const staff = await faculty.findOne({ email: req.session.email });
    console.log(staff)

    // 🟢 Step 1: Get all students in the faculty’s department
    const studentsInDept = await student.find({ department: staff.department.trim() });
    console.log("Students in Dept:", studentsInDept);

    const studentIds = studentsInDept.map(s => s._id);

    // 🟢 Step 2: Get logs only for those students and populate student info
    const logs = await Log.find({ studentId: { $in: studentIds } }).populate('studentId');

    console.log("Logs found:", logs);

    // 🟢 Step 3: Format logs to pass student name etc.
    const studentLogs = logs.map(log => ({
        _id: log._id,
        name: log.studentId.firstname + " " + log.studentId.lastname,
        date: log.date.toLocaleDateString(),
        log: log.description,
        status: log.status,
        file: log.file
    }));

    res.render('facultydashboard', {
        staff,
        students: studentLogs
    });
};


exports.approveLog = async (req, res) => {
    await Log.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.redirect('/faculty/dashboard');
};

exports.rejectLog = async (req, res) => {
    await Log.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
    res.redirect('/faculty/dashboard');
};
exports.facultyLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Logout error:", err);
            return res.redirect('/facultydashboard');
        }
        res.render('Flogin',{message:"Logout successfully"});  // Login page pe bhej do logout ke baad
    });
};



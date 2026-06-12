const{faculty}=require("../models/facultySchema");
const bcrypt = require('bcrypt');
const { student } = require('../models/studentSchema');
const { Log } = require('../models/log');
const { Notification } = require("../models/notification");

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

        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            return res.redirect('/faculty/dashboard');
        });
    } catch (err) {
        console.error("Error in login:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const staff = await faculty.findOne({ email: req.session.email });

        if (!staff) {
            return res.redirect('/faculty/login');
        }

        const isMatch = await bcrypt.compare(currentPassword, staff.password);
        if (!isMatch) {
            req.session.message = 'Incorrect current password!';
            return res.redirect('/faculty/dashboard');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        staff.password = hashedNewPassword;
        await staff.save();

        req.session.message = 'Password changed successfully!';
        res.redirect('/faculty/dashboard');
    } catch (err) {
        console.error('Error changing password:', err);
        req.session.message = 'Error changing password!';
        res.redirect('/faculty/dashboard');
    }
};
exports.facultydashboard = async (req, res) => {
    try {
        const staff = await faculty.findOne({ email: req.session.email });
        if (!staff) {
            req.session.destroy();
            return res.redirect('/faculty/login');
        }

        // 🟢 Step 1: Get all students in the faculty’s department
        const studentsInDept = await student.find({ 
            department: staff.department ? staff.department.trim() : "" 
        });

        const studentIds = studentsInDept.map(s => s._id);

        // 🟢 Step 2: Get logs only for those students and populate student info
        const logs = await Log.find({ studentId: { $in: studentIds } }).populate('studentId');

        // 🟢 Step 3: Format logs Safely
        const studentLogs = logs
            .filter(log => log.studentId) // Ensure studentId is populated
            .map(log => ({
                _id: log._id,
                name: (log.studentId.firstname || "") + " " + (log.studentId.lastname || ""),
                date: log.date ? log.date.toLocaleDateString() : "N/A",
                log: log.description,
                status: log.status,
                file: log.file
            }));

        // 🟢 Step 4: Fetch Notifications
        const notifications = await Notification.find({ userId: staff._id, userType: 'Faculty' }).sort({ createdAt: -1 });

        const message = req.session.message;
        delete req.session.message;

        res.render('facultydashboard', {
            staff,
            students: studentLogs,
            notifications,
            message
        });
    } catch (err) {
        console.error("Faculty dashboard error:", err);
        res.status(500).send("Error loading dashboard");
    }
};


exports.approveLog = async (req, res) => {
    try {
        const log = await Log.findByIdAndUpdate(req.params.id, { status: 'Approved' });
        if (log && log.studentId) {
            const notification = new Notification({
                userId: log.studentId,
                userType: 'Student',
                message: `Your report for Week ${log.week} has been Approved.`
            });
            await notification.save();
        }
        req.session.message = 'Report approved successfully!';
    } catch (err) {
        console.error("Error approving log:", err);
        req.session.message = 'Error approving report.';
    }
    res.redirect('/faculty/dashboard');
};

exports.rejectLog = async (req, res) => {
    try {
        const log = await Log.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
        if (log && log.studentId) {
            const notification = new Notification({
                userId: log.studentId,
                userType: 'Student',
                message: `Your report for Week ${log.week} has been Rejected.`
            });
            await notification.save();
        }
        req.session.message = 'Report rejected successfully!';
    } catch (err) {
        console.error("Error rejecting log:", err);
        req.session.message = 'Error rejecting report.';
    }
    res.redirect('/faculty/dashboard');
};
exports.facultyLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Logout error:", err);
            return res.redirect('/faculty/dashboard');
        }
        res.redirect('/faculty/login');
    });
};



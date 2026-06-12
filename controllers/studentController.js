const { student, studentSchema } = require("../models/studentSchema");
const { Log, logSchema } = require("../models/log");
const { Notification } = require("../models/notification");
const { faculty } = require("../models/facultySchema");
const bcrypt = require('bcrypt');

//<=======================rendering of pages==============================>
exports.getHomepage = (req, res) => {
    res.render('home');
}
exports.terms = (req, res) => {
    res.render('terms')
}

exports.Studentsignuppage = (req, res) => {
    res.render('Studentsignup', { message: "" })
}

exports.Studentloginpage = (req, res) => {
    res.render('Slogin', { message: "" });
}

//<=========================LOGIC for routes ============================>

//<=======================SIGNUP PAGE=========================================>
exports.signupform = async (req, res) => {
    const { firstname, lastname, email, password, rollno, course, department } = req.body
    if (firstname && lastname && email && password && rollno && course && department) {
        try {
            // Check if student already exists
            const existingStudent = await student.findOne({ $or: [{ email }, { rollno }] });
            if (existingStudent) {
                return res.render('Studentsignup', { message: "Student with this email or roll number already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const newstudent = new student({ 
                firstname, 
                lastname, 
                email, 
                password: hashedPassword, 
                course, 
                rollno, 
                department 
            })
            await newstudent.save()
            return res.render('Slogin', { message: "Student signed up successfully. Please log in." })
        }
        catch (err) {
            console.log("error in signup", err)
            return res.render('Studentsignup', { message: "Error in signup. Please try again." })
        }
    }
    return res.render('Studentsignup', { message: "All fields are required" })
}

//<==============================LOGIN PAGE=============================>
exports.loginform = async (req, res) => {
    const { rollno, email, password } = req.body;
    if (rollno && email && password) {
        try {
            const learner = await student.findOne({ rollno, email });
            if (!learner) {
                return res.status(404).render('Slogin', { message: "Invalid credentials" })
            }

            // Compare hashed password
            const isMatch = await bcrypt.compare(password, learner.password);
            if (!isMatch) {
                return res.status(401).render('Slogin', { message: "Invalid credentials" });
            }

            req.session.rollno = learner.rollno;
            req.session.email = learner.email;
            return res.redirect('/student/dashboard');
        }
        catch (err) {
            console.error(err);
            res.render('Slogin', { message: "Error: " + err.message })
        }
    } else {
        res.render('Slogin', { message: "All fields are required" })
    }
}

// exports.studentdashboard=async(req,res)=>{
//     if(!req.session.rollno || !req.session.email)
//     {
//         return res.render('Slogin',{message:"invalid credentials"})
//     }
//     const children=await student.findOne({rollno:req.session.rollno,email:req.session.email})
//     return res.render('studentdashboard',{children})
// }

//<======================STUDENT DASHBOARD KE LOGICS======================>


//<======student dashboard===========>
exports.studentdashboard = async (req, res) => {
    try {
        const studentData = await student.findOne({
            rollno: req.session.rollno,
            email: req.session.email
        });

        if (!studentData) {
            req.session.destroy();
            return res.redirect('/student/login');
        }

        const logs = await Log.find({ studentId: studentData._id }).sort({ week: 1 });
        const notifications = await Notification.find({ userId: studentData._id, userType: 'Student' }).sort({ createdAt: -1 });

        const message = req.session.message;
        delete req.session.message;

        return res.render('studentdashboard', {
            student: studentData,
            logs,
            notifications,
            message
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).send("Error loading dashboard");
    }
};

//<=======student submit log=========>
exports.submitLog=async(req,res)=>{
    const {week,description}=req.body;

    const studentData=await student.findOne({
        rollno:req.session.rollno,
        email:req.session.email
    });

    if(!studentData)
    {
        return res.redirect('/student/login')
    }

    const newLog=new Log({
        studentId:studentData._id,
        week,
        description,
        file: req.file ? req.file.filename : null // Save file name
    });

    await newLog.save();

    const faculties = await faculty.find({ department: studentData.department });
    const notifications = faculties.map(f => ({
        userId: f._id,
        userType: 'Faculty',
        message: `Student ${studentData.firstname} ${studentData.lastname} uploaded a new report for Week ${week}.`
    }));
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    req.session.message = "Report submitted successfully!";
    return res.redirect('/student/dashboard')
}

//================= student logout logic==========================>
 exports.logout=async(req,res)=>{
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.status(500).send("Logout failed");
        }
        res.redirect('/student/login');
    });
 }

//<================================render edit log page=====================>
 exports.getEditLogPage=async(req,res)=>{
    const logId=req.params.id;
    try{
        const log=await Log.findById(logId);
        if(!log)
        {
            return res.send('log not found ')
        }
        res.render('editlog',{log});
    }
    catch(err)
    {
     console.error(err);
     res.send('error loading log for edit')
    }
 };

 //<=============================to edit the log details =========================>
 exports.postEditLog = async (req, res) => {
    const logId = req.params.id;
    const { week, description } = req.body;

    const updateData = {
        week,
        description,
        updatedAt: new Date()
    };

    // If a new file is uploaded, update it too
    if (req.file) {
        updateData.file = req.file.filename;
    }

    try {
        await Log.findByIdAndUpdate(logId, updateData);
        req.session.message = 'Log details updated successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error(err);
        res.send('Error updating log');
    }
};
//<============================delete the log===========================>
exports.deleteLog = async(req, res) => {
    const logId = req.params.id;
    try {
        await Log.findByIdAndDelete(logId);
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error(err);
        res.send('Error deleting log');
    }
};

//<=========================CHANGE PASSWORD================================>
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const studentData = await student.findOne({
            rollno: req.session.rollno,
            email: req.session.email
        });

        if (!studentData) {
            return res.redirect('/student/login');
        }

        const isMatch = await bcrypt.compare(currentPassword, studentData.password);
        if (!isMatch) {
            req.session.message = 'Incorrect current password!';
            return res.redirect('/student/dashboard');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        studentData.password = hashedNewPassword;
        await studentData.save();

        req.session.message = 'Password changed successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error('Error changing password:', err);
        req.session.message = 'Error changing password!';
        res.redirect('/student/dashboard');
    }
};






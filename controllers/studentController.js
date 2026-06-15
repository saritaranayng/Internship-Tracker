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

            let messageStr = "";
            if (learner.isActive === false) {
                learner.isActive = true;
                await learner.save();
                messageStr = "Welcome back! Your account has been reactivated.";
            }

            req.session.rollno = learner.rollno;
            req.session.email = learner.email;
            
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.render('Slogin', { message: "Error saving session" });
                }
                if (messageStr) {
                    req.session.message = messageStr;
                }
                return res.redirect('/student/dashboard');
            });
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
exports.submitLog=async(req,res,next)=>{
    try {
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
            file: req.file ? req.file.path : null // Save Cloudinary URL
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
    } catch (err) {
        next(err);
    }
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
 exports.getViewLogPage = async (req, res) => {
    const logId = req.params.id;
    try {
        const studentData = await student.findOne({ email: req.session.email });
        if (!studentData) return res.redirect('/student/login');
        const log = await Log.findById(logId);
        if (!log) {
            return res.send('log not found ');
        }
        res.render('viewreport', { student: studentData, log });
    } catch(err) {
        console.error(err);
        res.send('error loading view page');
    }
 };

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
        status: 'Pending',
        updatedAt: new Date()
    };

    // If a new file is uploaded, update it too
    if (req.file) {
        updateData.file = req.file.path; // Save Cloudinary URL
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

        req.session.destroy(err => {
            if (err) {
                console.error("Session destruction error:", err);
            }
            res.render('Slogin', { message: 'Password changed successfully! Please log in with your new password.' });
        });
    } catch (err) {
        console.error('Error changing password:', err);
        req.session.message = 'Error changing password!';
        res.redirect('/student/dashboard');
    }
};






exports.updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, email, phone } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });

        if (!studentData) {
            return res.redirect('/student/login');
        }

        studentData.firstname = firstname;
        studentData.lastname = lastname;
        studentData.email = email;
        studentData.phone = phone;

        if (req.file) {
            studentData.profilePicture = req.file.path;
        }

        await studentData.save();
        req.session.email = email; // update session email in case it changed
        req.session.message = 'Profile updated successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error('Error updating profile:', err);
        req.session.message = 'Error updating profile!';
        res.redirect('/student/dashboard');
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { weeklyReminders, feedbackNotifs, gradeNotifs } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });

        if (!studentData) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        studentData.preferences = {
            weeklyReminders: weeklyReminders === 'on',
            feedbackNotifs: feedbackNotifs === 'on',
            gradeNotifs: gradeNotifs === 'on'
        };

        await studentData.save();
        res.json({ success: true, message: 'Preferences updated' });
    } catch (err) {
        console.error('Error updating preferences:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) {
            return res.redirect('/student/login');
        }

        // Delete all logs related to student
        await Log.deleteMany({ studentId: studentData._id });
        // Delete all notifications related to student
        await Notification.deleteMany({ userId: studentData._id, userType: 'Student' });
        // Delete the student account
        await student.findByIdAndDelete(studentData._id);

        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            res.redirect('/student/login');
        });
    } catch (err) {
        console.error('Error deleting account:', err);
        req.session.message = 'Error deleting account!';
        res.redirect('/student/dashboard');
    }
};

exports.deactivateAccount = async (req, res) => {
    try {
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) {
            return res.redirect('/student/login');
        }

        // Set account to inactive instead of deleting
        studentData.isActive = false;
        await studentData.save();

        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            res.render('Slogin', { message: 'Your account has been successfully deactivated. Log in anytime to reactivate it.' });
        });
    } catch (err) {
        console.error('Error deactivating account:', err);
        req.session.message = 'Error deactivating account!';
        res.redirect('/student/dashboard');
    }
};

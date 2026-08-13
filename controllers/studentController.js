const { student, studentSchema } = require("../models/studentSchema");
const { Log, logSchema } = require("../models/log");
const { DailyTask } = require("../models/dailyTask");
const { WeeklySummary } = require("../models/weeklySummary");
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

        const dailyTasks = await DailyTask.find({ studentId: studentData._id }).sort({ date: -1 });
        const weeklySummaries = await WeeklySummary.find({ studentId: studentData._id }).sort({ week: 1 });
        const notifications = await Notification.find({ userId: studentData._id, userType: 'Student' }).sort({ createdAt: -1 });

        // Calculate progress metrics
        const totalTasks = dailyTasks.length;
        const totalHours = dailyTasks.reduce((sum, task) => sum + (task.hoursWorked || 0), 0);
        const totalSummaries = weeklySummaries.length;
        const approvedSummaries = weeklySummaries.filter(s => s.status === 'Approved').length;

        // Parse duration
        let durationWeeks = 8;
        if (studentData.internship && studentData.internship.duration) {
            const num = parseInt(studentData.internship.duration);
            if (!isNaN(num)) {
                if (studentData.internship.duration.toLowerCase().includes('month')) {
                    durationWeeks = num * 4;
                } else {
                    durationWeeks = num;
                }
            }
        }

        const progressPercentage = durationWeeks > 0 ? Math.min(100, Math.round((approvedSummaries / durationWeeks) * 100)) : 0;

        // Last weekly summary for previous week goals reference
        const lastWeeklySummary = await WeeklySummary.findOne({ studentId: studentData._id }).sort({ week: -1 });

        const message = req.session.message;
        delete req.session.message;

        return res.render('studentdashboard', {
            student: studentData,
            dailyTasks,
            weeklySummaries,
            notifications,
            progress: {
                totalTasks,
                totalHours,
                totalSummaries,
                approvedSummaries,
                progressPercentage,
                durationWeeks
            },
            lastWeeklySummary,
            message
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).send("Error loading dashboard");
    }
};

//<=======student submit task log=========>
exports.submitTask = async (req, res) => {
    try {
        const { week, title, date, description, hoursWorked, status, gitLink, prLink, demoLink } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        // Check if summary already exists
        const existingSummary = await WeeklySummary.findOne({ studentId: studentData._id, week: Number(week) });
        if (existingSummary) {
            req.session.message = `Cannot add daily tasks for Week ${week}. The weekly summary has already been submitted.`;
            return res.redirect('/student/dashboard');
        }

        const fileUrl = req.file ? req.file.path : '';

        const newTask = new DailyTask({
            studentId: studentData._id,
            week: Number(week),
            title,
            date: date ? new Date(date) : new Date(),
            description,
            hoursWorked: Number(hoursWorked),
            status,
            file: fileUrl,
            gitLink,
            prLink,
            demoLink
        });

        await newTask.save();
        req.session.message = 'Daily task log submitted successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error("Error submitting task:", err);
        req.session.message = 'Error submitting task log!';
        res.redirect('/student/dashboard');
    }
};

exports.editTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, date, description, hoursWorked, status, gitLink, prLink, demoLink } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        const task = await DailyTask.findById(taskId);
        if (!task) {
            req.session.message = 'Task not found.';
            return res.redirect('/student/dashboard');
        }

        // Check lock rules
        const summary = await WeeklySummary.findOne({ studentId: studentData._id, week: task.week });
        if (summary) {
            const canEdit = (summary.status === 'Changes Requested' && summary.allowTaskEdits);
            if (!canEdit) {
                req.session.message = 'Error: Daily tasks for this week are locked and read-only.';
                return res.redirect('/student/dashboard');
            }
        }

        let fileUrl = task.file;
        if (req.file) {
            fileUrl = req.file.path;
        }

        task.title = title;
        task.date = date ? new Date(date) : task.date;
        task.description = description;
        task.hoursWorked = Number(hoursWorked);
        task.status = status;
        task.file = fileUrl;
        task.gitLink = gitLink;
        task.prLink = prLink;
        task.demoLink = demoLink;

        await task.save();
        req.session.message = 'Daily task log updated successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error("Error editing task:", err);
        req.session.message = 'Error updating task log!';
        res.redirect('/student/dashboard');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        const task = await DailyTask.findById(taskId);
        if (!task) {
            req.session.message = 'Task not found.';
            return res.redirect('/student/dashboard');
        }

        // Check lock rules
        const summary = await WeeklySummary.findOne({ studentId: studentData._id, week: task.week });
        if (summary) {
            const canDelete = (summary.status === 'Changes Requested' && summary.allowTaskEdits);
            if (!canDelete) {
                req.session.message = 'Error: Daily tasks for this week are locked and read-only.';
                return res.redirect('/student/dashboard');
            }
        }

        await DailyTask.findByIdAndDelete(taskId);
        req.session.message = 'Daily task log deleted successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error("Error deleting task:", err);
        req.session.message = 'Error deleting task log!';
        res.redirect('/student/dashboard');
    }
};

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

exports.submitSummary = async (req, res) => {
    try {
        const { week, workCompleted, challengesFaced, challengesSolved, skillsLearned, goalsNextWeek } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        const weekNum = Number(week);

        const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes('json'));

        // 1. Check if summary already exists
        const existing = await WeeklySummary.findOne({ studentId: studentData._id, week: weekNum });
        if (existing) {
            const msg = `Error: A weekly summary for Week ${week} has already been submitted.`;
            if (isJson) return res.json({ success: false, message: msg });
            req.session.message = msg;
            return res.redirect('/student/dashboard');
        }


        const fileUrl = req.file ? req.file.path : '';

        const newSummary = new WeeklySummary({
            studentId: studentData._id,
            week: weekNum,
            workCompleted,
            challengesFaced,
            challengesSolved,
            skillsLearned,
            goalsNextWeek,
            status: 'Pending',
            file: fileUrl
        });

        await newSummary.save();

        // Lock the daily tasks for this week
        await DailyTask.updateMany({ studentId: studentData._id, week: weekNum }, { isLocked: true });

        // Generate notification to faculty
        const faculties = await faculty.find({ department: studentData.department });
        const notifications = faculties.map(f => ({
            userId: f._id,
            userType: 'Faculty',
            message: `Student ${studentData.firstname} ${studentData.lastname} submitted a weekly summary for Week ${week}.`
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        if (isJson) {
            return res.json({ success: true, message: 'Weekly summary submitted successfully!' });
        }
        req.session.message = 'Weekly summary submitted successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error("Error submitting summary:", err);
        require('fs').appendFileSync('error_log.txt', new Date().toISOString() + ': ' + (err.stack || err) + '\n');
        const msg = 'Error submitting weekly summary! ' + (err.message || '');
        const isJson = req.xhr || (req.headers && req.headers.accept && req.headers.accept.includes('json'));
        if (isJson) return res.json({ success: false, message: msg });
        req.session.message = msg;
        res.redirect('/student/dashboard');
    }
};

exports.editSummary = async (req, res) => {
    try {
        const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes('json'));
        const summaryId = req.params.id;
        const { workCompleted, challengesFaced, challengesSolved, skillsLearned, goalsNextWeek } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        const summary = await WeeklySummary.findById(summaryId);
        if (!summary) {
            const msg = 'Weekly summary not found.';
            if (isJson) return res.json({ success: false, message: msg });
            req.session.message = msg;
            return res.redirect('/student/dashboard');
        }

        if (summary.status === 'Approved') {
            const msg = 'Approved weekly summaries cannot be edited.';
            if (isJson) return res.json({ success: false, message: msg });
            req.session.message = msg;
            return res.redirect('/student/dashboard');
        }

        let fileUrl = summary.file;
        if (req.file) {
            fileUrl = req.file.path;
        }

        summary.workCompleted = workCompleted;
        summary.challengesFaced = challengesFaced;
        summary.challengesSolved = challengesSolved;
        summary.skillsLearned = skillsLearned;
        summary.goalsNextWeek = goalsNextWeek;
        summary.file = fileUrl;
        summary.status = 'Pending'; // Change back to Pending after edit

        await summary.save();

        // Generate notification to faculty
        const faculties = await faculty.find({ department: studentData.department });
        const notifications = faculties.map(f => ({
            userId: f._id,
            userType: 'Faculty',
            message: `Student ${studentData.firstname} ${studentData.lastname} updated their weekly summary for Week ${summary.week}.`
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        if (isJson) {
            return res.json({ success: true, message: 'Weekly summary updated successfully!' });
        }
        req.session.message = 'Weekly summary updated successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error("Error editing summary:", err);
        const msg = 'Error updating weekly summary!';
        const isJson = req.xhr || (req.headers && req.headers.accept && req.headers.accept.includes('json'));
        if (isJson) return res.json({ success: false, message: msg });
        req.session.message = msg;
        res.redirect('/student/dashboard');
    }
};

exports.getFinalReport = async (req, res) => {
    try {
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });
        if (!studentData) return res.redirect('/student/login');

        const dailyTasks = await DailyTask.find({ studentId: studentData._id }).sort({ date: 1 });
        const weeklySummaries = await WeeklySummary.find({ studentId: studentData._id }).sort({ week: 1 });

        const totalTasks = dailyTasks.length;
        const totalHours = dailyTasks.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);

        // Extract a unique list of skills learned from all summaries
        const skillsSet = new Set();
        weeklySummaries.forEach(s => {
            if (s.skillsLearned) {
                s.skillsLearned.split(',').forEach(sk => {
                    const trimmed = sk.trim();
                    if (trimmed) skillsSet.add(trimmed);
                });
            }
        });
        const skillsLearnedList = Array.from(skillsSet);

        // Determine final status
        let finalStatus = 'In Progress';
        const approvedCount = weeklySummaries.filter(s => s.status === 'Approved').length;
        let durationWeeks = 8;
        if (studentData.internship && studentData.internship.duration) {
            const num = parseInt(studentData.internship.duration);
            if (!isNaN(num)) {
                durationWeeks = studentData.internship.duration.toLowerCase().includes('month') ? num * 4 : num;
            }
        }
        if (approvedCount >= durationWeeks && approvedCount > 0) {
            finalStatus = 'Completed';
        }

        res.render('finalreport', {
            student: studentData,
            dailyTasks,
            weeklySummaries,
            totalTasks,
            totalHours,
            skillsLearnedList,
            finalStatus,
            durationWeeks
        });
    } catch (err) {
        console.error("Error generating final report:", err);
        res.status(500).send("Error generating final report");
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

        // Delete all logs, daily tasks, and weekly summaries related to student
        await Log.deleteMany({ studentId: studentData._id });
        await DailyTask.deleteMany({ studentId: studentData._id });
        await WeeklySummary.deleteMany({ studentId: studentData._id });
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

exports.updateInternshipDetails = async (req, res) => {
    try {
        const { companyName, contactDetails, internshipField, duration, mode, isPaid, stipend, mentorDetails, gitLink, driveLink } = req.body;
        const studentData = await student.findOne({ rollno: req.session.rollno, email: req.session.email });

        if (!studentData) {
            return res.redirect('/student/login');
        }

        if (!gitLink) {
            req.session.message = 'Error: GitHub Repository Link is required!';
            return res.redirect('/student/dashboard');
        }

        let offerLetterUrl = (studentData.internship && studentData.internship.offerLetter) ? studentData.internship.offerLetter : '';
        if (req.file) {
            offerLetterUrl = req.file.path;
        }

        if (!offerLetterUrl) {
            req.session.message = 'Error: Offer Letter upload is required!';
            return res.redirect('/student/dashboard');
        }

        studentData.internship = {
            companyName,
            contactDetails,
            internshipField,
            duration,
            mode,
            isPaid,
            stipend: isPaid === 'Paid' ? Number(stipend) : 0,
            mentorDetails,
            gitLink,
            driveLink,
            offerLetter: offerLetterUrl
        };

        await studentData.save();
        req.session.message = 'Internship details updated successfully!';
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error('Error updating internship details:', err);
        req.session.message = 'Error updating internship details!';
        res.redirect('/student/dashboard');
    }
};

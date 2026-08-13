const{faculty}=require("../models/facultySchema");
const bcrypt = require('bcrypt');
const { student } = require('../models/studentSchema');
const { Log } = require('../models/log');
const { DailyTask } = require('../models/dailyTask');
const { WeeklySummary } = require('../models/weeklySummary');
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

        // 1. Get all students in the faculty’s department
        const studentsInDept = await student.find({ 
            department: staff.department ? staff.department.trim() : "" 
        });

        const studentIds = studentsInDept.map(s => s._id);

        // 2. Get Weekly Summaries only for those students and populate student info
        const weeklySummaries = await WeeklySummary.find({ studentId: { $in: studentIds } })
            .populate('studentId')
            .sort({ date: -1 });

        // 3. Get all daily tasks for these students to group them
        const dailyTasks = await DailyTask.find({ studentId: { $in: studentIds } }).sort({ date: 1 });

        // 4. Format summaries safely, bundling their respective daily tasks
        const studentSummaries = weeklySummaries
            .filter(summary => summary.studentId) // Ensure studentId is populated
            .map(summary => {
                const summaryTasks = dailyTasks.filter(task => 
                    task.studentId.toString() === summary.studentId._id.toString() && 
                    task.week === summary.week
                );
                return {
                    _id: summary._id,
                    student: summary.studentId,
                    name: `${summary.studentId.firstname || ""} ${summary.studentId.lastname || ""}`,
                    week: summary.week,
                    workCompleted: summary.workCompleted,
                    challengesFaced: summary.challengesFaced,
                    challengesSolved: summary.challengesSolved,
                    skillsLearned: summary.skillsLearned,
                    goalsNextWeek: summary.goalsNextWeek,
                    status: summary.status,
                    feedback: summary.feedback,
                    file: summary.file,
                    allowTaskEdits: summary.allowTaskEdits,
                    date: summary.date ? summary.date.toLocaleDateString() : "N/A",
                    tasks: summaryTasks
                };
            });

        // 5. Fetch Notifications
        const notifications = await Notification.find({ userId: staff._id, userType: 'Faculty' }).sort({ createdAt: -1 });

        const message = req.session.message;
        delete req.session.message;

        res.render('facultydashboard', {
            staff,
            students: studentSummaries, // Keeping the variable name 'students' to minimize changes in facultydashboard EJS
            allStudents: studentsInDept,
            notifications,
            message
        });
    } catch (err) {
        console.error("Faculty dashboard error:", err);
        res.status(500).send("Error loading dashboard");
    }
};

exports.approveSummary = async (req, res) => {
    try {
        const feedback = req.body.feedback || '';
        const summaryId = req.params.id;

        const summary = await WeeklySummary.findByIdAndUpdate(summaryId, {
            status: 'Approved',
            feedback: feedback
        }, { new: true });

        if (summary && summary.studentId) {
            let msg = `Your weekly summary for Week ${summary.week} has been Approved.`;
            if (feedback.trim()) msg += ` Remarks: ${feedback}`;
            
            const notification = new Notification({
                userId: summary.studentId,
                userType: 'Student',
                message: msg
            });
            await notification.save();
        }

        req.session.message = 'Weekly summary approved successfully!';
    } catch (err) {
        console.error("Error approving summary:", err);
        req.session.message = 'Error approving weekly summary.';
    }
    res.redirect('/faculty/dashboard');
};

exports.requestChangesSummary = async (req, res) => {
    try {
        const feedback = req.body.feedback || 'Changes requested.';
        const allowTaskEdits = req.body.allowTaskEdits === 'true' || req.body.allowTaskEdits === 'on';
        const summaryId = req.params.id;

        const summary = await WeeklySummary.findByIdAndUpdate(summaryId, {
            status: 'Changes Requested',
            feedback: feedback,
            allowTaskEdits: allowTaskEdits
        }, { new: true });

        if (summary && summary.studentId) {
            let msg = `Changes requested on your Weekly Summary for Week ${summary.week}.`;
            if (feedback.trim()) msg += ` Remarks: ${feedback}`;
            if (allowTaskEdits) msg += ` (You are allowed to edit your daily task logs for this week).`;

            const notification = new Notification({
                userId: summary.studentId,
                userType: 'Student',
                message: msg
            });
            await notification.save();
        }

        req.session.message = 'Changes requested successfully!';
    } catch (err) {
        console.error("Error requesting changes on summary:", err);
        req.session.message = 'Error requesting changes.';
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

exports.updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, email, designation, department } = req.body;
        const updateData = { firstname, lastname, email, designation, department };

        if (req.file) {
            updateData.profilePicture = req.file.path;
        }

        const faculty = require('../models/facultySchema').faculty;
        await faculty.findOneAndUpdate({ email: req.session.email }, updateData);
        req.session.email = email; // In case they update their email
        
        req.session.message = "Profile updated successfully!";
        res.redirect('/faculty/dashboard');
    } catch (error) {
        console.error("Error updating profile:", error);
        req.session.message = "Failed to update profile.";
        res.redirect('/faculty/dashboard');
    }
};

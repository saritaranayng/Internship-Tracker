const mongoose = require('mongoose');
const studentdetails = require('./controllers/studentController');
const { student } = require('./models/studentSchema');
const { DailyTask } = require('./models/dailyTask');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/internship-tracker").then(async () => {
    try {
        const studentData = await student.findOne({});
        if (!studentData) { console.log("No student found"); return process.exit(); }
        
        // Ensure at least one task
        await DailyTask.create({ studentId: studentData._id, week: 9, date: new Date(), title: 't', description: 'd', hoursWorked: 1, status: 'Completed' });

        const req = {
            session: { rollno: studentData.rollno, email: studentData.email },
            body: {
                week: "9",
                workCompleted: "test",
                challengesFaced: "test",
                challengesSolved: "test",
                skillsLearned: "test",
                goalsNextWeek: "test"
            },
            file: null
        };
        const res = {
            redirect: (url) => console.log("Redirected to:", url, req.session.message)
        };
        await studentdetails.submitSummary(req, res);
    } catch (e) {
        console.error("Test script error:", e);
    }
    mongoose.disconnect();
});

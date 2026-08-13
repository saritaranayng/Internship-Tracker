const mongoose = require('mongoose');
require('dotenv').config();
const { WeeklySummary } = require("./models/weeklySummary");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/internship-tracker").then(async () => {
    try {
        const newSummary = new WeeklySummary({
            studentId: new mongoose.Types.ObjectId(),
            week: 2,
            workCompleted: "work",
            challengesFaced: "challenges",
            challengesSolved: "solutions",
            skillsLearned: "skills",
            goalsNextWeek: "goals",
            status: 'Pending',
            file: ''
        });
        await newSummary.save();
        console.log("Success");
    } catch (err) {
        console.error("Error:", err);
    }
    mongoose.disconnect();
});

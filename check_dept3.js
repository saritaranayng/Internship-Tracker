const mongoose = require('mongoose');
const { faculty } = require('./models/facultySchema');
const { student } = require('./models/studentSchema');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internDB')
    .then(async () => {
        const staff = await faculty.findOne({ firstname: 'nitesh' });
        console.log("Faculty:", staff?.firstname, staff?.lastname, "| Dept:", staff?.department);
        
        const students = await student.find({}, 'firstname lastname department course');
        console.log("\nStudents:");
        students.forEach(s => console.log(s.firstname, s.lastname, "- Dept:", s.department, "- Course:", s.course));
        
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

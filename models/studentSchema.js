const mongoose=require('mongoose');
const studentSchema=mongoose.Schema(
    {
        email:String,
        password:{type:String,minlength:6},
        firstname:String,
        lastname:String,
        course:String,
        department: String, 
        rollno: { type: Number, required: true, unique: true },
        phone: String,
        profilePicture: String,
        preferences: {
            weeklyReminders: { type: Boolean, default: true },
            feedbackNotifs: { type: Boolean, default: true },
            gradeNotifs: { type: Boolean, default: true }
        },
        isActive: { type: Boolean, default: true },
        createdAt:{type:Date,default:Date.now}
    },
    {
        timestamps:true
    }
);
const student=mongoose.model('Student',studentSchema);
module.exports={studentSchema,student};
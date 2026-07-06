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
        internship: {
            companyName: { type: String, default: '' },
            contactDetails: { type: String, default: '' },
            internshipField: { type: String, default: '' },
            duration: { type: String, default: '' },
            mode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', ''], default: '' },
            isPaid: { type: String, enum: ['Paid', 'Unpaid', ''], default: '' },
            stipend: { type: Number, default: 0 },
            mentorDetails: { type: String, default: '' },
            gitLink: { type: String, default: '' },
            driveLink: { type: String, default: '' },
            offerLetter: { type: String, default: '' }
        },
        createdAt:{type:Date,default:Date.now}
    },
    {
        timestamps:true
    }
);
const student=mongoose.model('Student',studentSchema);
module.exports={studentSchema,student};
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
        createdAt:{type:Date,default:Date.now}
    },
    {
        timestamps:true
    }
);
const student=mongoose.model('Student',studentSchema);
module.exports={studentSchema,student};
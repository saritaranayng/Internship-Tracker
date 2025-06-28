const mongoose=require('mongoose');
const facultySchema=mongoose.Schema({
    
    email:String,
    password:String,
    firstname:String,
    lastname:String,
    designation:String,
    department:String
})
const faculty=mongoose.model("Faculty",facultySchema)

module.exports={facultySchema,faculty};
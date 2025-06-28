const {student,studentSchema } = require("../models/studentSchema");
const{Log,logSchema}=require("../models/log")
const multer = require('multer');

//<=======================rendering of pages==============================>
exports.getHomepage=(req,res)=>
{
    res.render('home');
}
exports.terms=(req,res)=>{
    res.render('terms')
}

exports.Studentsignuppage=(req,res)=>{
    res.render('Studentsignup',{message:""})
}

exports.Studentloginpage=(req,res)=>{
    res.render('Slogin',{message:""});
}




//<=========================LOGIC for routes ============================>

//<=======================SIGNUP PAGE=========================================>
exports.signupform=async(req,res)=>{
    const {firstname,lastname,email,password,rollno,course,department }=req.body
    if(firstname||lastname||email||password||rollno||course || department )
    {

     try
         {
            const newstudent=new student({firstname,lastname,email,password,course,rollno,department})
            await newstudent.save()
           return  res.render('Slogin',{message:"student signed up "})
         }
    catch(err)
        {
           console.log("error in signup",err)
        }
         
    }
    return res.render('Studentsignup',{message:"all fields required"})
}


//<==============================LOGIN PAGE=============================>
exports.loginform=async(req,res)=>{
    const {rollno,email,password,}=req.body;
    if(rollno|| email || password)
    {
        try
        {
        const learner=await student.findOne({rollno,email,password});
        console.log(learner)
        if(!learner)
        {
           return res.status(404).render('Slogin',{message:"invalid credentials"})
        }
        req.session.rollno=learner.rollno;
        req.session.email=learner.email;
        return res.redirect('/student/dashboard');
        }
        catch(err)
        {
            res.render('Slogin',{message:"Internal server error"})
        }

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
    const studentData = await student.findOne({
        rollno: req.session.rollno,
        email: req.session.email
    });
    const logs = await Log.find({ studentId: studentData._id }).sort({ week: 1 });

    const message = req.session.message;
  delete req.session.message;

    return res.render('studentdashboard', {
        student: studentData,
        logs,
        message
    });
};

//<=======student submit log=========>
exports.submitLog=async(req,res)=>{
    const {week,description}=req.body;

    const studentData=await student.findOne({
        rollno:req.session.rollno,
        email:req.session.email
    });

    if(!studentData)
    {
        return res.redirect('/Slogin')
    }

    const newLog=new Log({
        studentId:studentData._id,
        week,
        description,
        file: req.file ? req.file.filename : null // Save file name
    });

    await newLog.save();

    return res.redirect('/student/dashboard')
}

//================= student logout logic==========================>
 exports.logout=async(req,res)=>{
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.status(500).send("Logout failed");
        }
        res.redirect('/Slogin');  // Logout ke baad login page pe bhej do
    });
 }

//<================================render edit log page=====================>
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
        updatedAt: new Date()
    };

    // If a new file is uploaded, update it too
    if (req.file) {
        updateData.file = req.file.filename;
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






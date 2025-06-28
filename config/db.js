const mongoose=require('mongoose');
const connectDB=async()=>{
try
{
await mongoose.connect('mongodb://127.0.0.1:27017/internDB')
console.log("connect to database")
}
catch(error)
{
console.log("Unable to connect to database")
}
}

module.exports=connectDB;
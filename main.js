const express=require('express');
const app=express();
const index=require('./routes/index');
const path=require('path')
const mongoose=require('mongoose');
const connectDB=require("./config/db");
const { connect} = require('http2');
const { Session } = require('inspector/promises');
const session = require('express-session');
connectDB();

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(session({
    secret:'myfavkey',
    resave:false,
    saveUninitialized:true,
    cookie:{
       maxAge:1000*60*60
    }
}));

app.set('view engine','ejs');

app.use('/',index);

app.listen(3300,()=>{console.log("Server is running")})

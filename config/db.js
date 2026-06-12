const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log("Using existing database connection");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internDB');
        console.log(`Connected to database: ${conn.connection.name}`);
    } catch (error) {
        console.error("🚨 DATABASE CONNECTION ERROR:", error.message);
        console.error("Make sure your MONGODB_URI is set in Vercel and your IP is whitelisted in MongoDB Atlas.");
    }
}

module.exports = connectDB;
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
        console.error("Unable to connect to database:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
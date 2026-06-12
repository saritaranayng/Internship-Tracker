const mongoose = require('mongoose');

async function testConnection() {
    try {
        await mongoose.connect('mongodb+srv://saritarana830:saritamongo@saritacluster.hy1q1.mongodb.net/?appName=SaritaCluster');
        console.log('Successfully connected to MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to connect:', err);
        process.exit(1);
    }
}

testConnection();

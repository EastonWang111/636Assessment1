const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User');
require('dotenv').config();

const createAdmin = async () =>{
    try{
        //connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/userdetail')
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({email: 'admin@example.com'});
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        //Create admin user
        const adminUser = new User({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123', // This will be hashed by the pre-save hook
            role: 'admin',
            university: 'System',
            address: 'System'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

        //creata a regular user for testing
        const regularUser = new User({
            name: 'Test User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
            university: 'Test University',
            address: 'Test Address'
        });

        await regularUser.save();
        console.log('Regular user created successfully!');
        console.log('Email: user@example.com');
        console.log('Password: user123');

    }catch(error){
        console.error('Error creating users:', error);
    }finally{
        mongoose.connection.close();
    }
};

createAdmin();
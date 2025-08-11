const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () =>{
    try{
        //connect to MongoDB
        await mongoose.connect('mongodb+srv://n11927399:VesdSssKaDMYGMQx@cluster0.qi23k34.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=Cluster0')
        console.log('Connected to MOngoDB');

        //check if admin already exists
        const existingAdmin = await User.findOne({email: 'admin@example.com'});
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        //Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
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

    }catch(erroe){
        console.error('Erroe creating users:', error);

    }finally{
        mongoose.connection.close();
    }

}
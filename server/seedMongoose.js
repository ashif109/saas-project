require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Mongoose');

        // Fetch or create a college
        let college = await mongoose.model('College', new mongoose.Schema({}, { strict: false })).findOne();
        if (!college) {
            console.log('No college found. You may need to create a college first.');
            college = await mongoose.model('College', new mongoose.Schema({}, { strict: false })).create({ name: 'Default College' });
        }

        let user = await User.findOne({ email: 'michealasif41@gmail.com' });
        
        if (user) {
            user.password = 'Faculty@123';
            user.role = 'FACULTY';
            user.name = 'Micheal Asif';
            user.college = college._id;
            await user.save();
            console.log('User updated in Mongoose');
        } else {
            user = await User.create({
                name: 'Micheal Asif',
                email: 'michealasif41@gmail.com',
                password: 'Faculty@123',
                role: 'FACULTY',
                phone: '1234567890',
                college: college._id
            });
            console.log('User created in Mongoose');
        }

        console.log('Mongoose seeding complete.');
    } catch (err) {
        console.error('Mongoose seed error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();

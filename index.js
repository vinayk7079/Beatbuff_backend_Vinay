const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Don't forget to import bcrypt
const app = express();
const port = process.env.PORT || 5000;

mongoose.connect('mongodb://127.0.0.1:27017/SIET3')
    .then(() => {
        console.log('Connected to SIET3 database');
    })
    .catch((err) => {
        console.error(err);
    });

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, default: Date.now, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('students', UserSchema);

app.use(express.json());
app.use(cors());

app.get('/home', async (req, resp) => {
    try {
        const users = await User.find({}, 'firstName lastName dateOfBirth email password date');
        resp.json(users);
    } catch (e) {
        console.error(e);
        resp.status(500).send('Failed to retrieve user data');
    }
});

app.post('/dashboard', async (req, resp) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            // Send only the necessary information for the dashboard
            resp.json({ success: true, firstName: user.firstName });
        } else {
            resp.json({ success: false });
        }
    } catch (e) {
        console.error(e);
        resp.status(500).send('Something went wrong during login.');
    }
});

app.post('/login', async (req, resp) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (user) {
            resp.json({ success: true });
        } else {
            resp.json({ success: false });
        }
    } catch (e) {
        console.error(e);
        resp.status(500).send('Something went wrong during login.');
    }
});

app.post('/register', async (req, resp) => {
    try {
        const { password, ...userData } = req.body; // Extract password from userData
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ ...userData, password: hashedPassword });
        const result = await user.save();
        const userWithoutPassword = result.toObject();
        resp.send(userWithoutPassword);
    } catch (e) {
        console.error(e);
        resp.status(500).send('Something Went Wrong');
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const upload = require('../utils/upload'); // Adjust the path as necessary

// Function to generate a unique user ID
const generateUserID = async () => {
    let userID;
    let userExists;

    do {
        // Generate a random number and prepend with 'U'
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        userID = `U${randomNum}`;

        // Check if this userID already exists in the database
        userExists = await User.findOne({ userID });

    } while (userExists);

    return userID;
};

// Signup Route
router.post('/signup', upload.single('profilePic'), async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, username } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if the email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already in use' });
        }

        // Generate a unique userID
        const userID = await generateUserID();

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            userID, // Assign the generated userID
            firstName,
            lastName,
            email,
            password: hashedPassword,
            username,
            profilePic: req.file ? `/uploads/${req.file.filename}` : null, // Store the path to the profile picture
        });

        const savedUser = await newUser.save();

        // Exclude password from the response
        const userResponse = {
            _id: savedUser._id,
            userID: savedUser.userID,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            username: savedUser.username,
            userType: savedUser.userType,
            profilePic: savedUser.profilePic, // Include the profilePic in the response
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        };

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if all required fields are present
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Exclude the password from the response
        const userResponse = {
            _id: user._id,
            userID: user.userID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            userType: user.userType,
            profilePic: user.profilePic, // Include profilePic in the response
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Respond with the user object
        res.status(200).json({ message: 'Login successful', user: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Route
router.post('/updateUser', upload.single('profilePic'), async (req, res) => {
    try {
        const { userID, firstName, lastName, email, username } = req.body;

        // Create an update object
        const updateData = { firstName, lastName, email, username };

        // Check if a new profile picture was uploaded
        if (req.file) {
            updateData.profilePic = `/uploads/${req.file.filename}`; // Update the profilePic path
        }

        const updatedUser = await User.findOneAndUpdate(
            { userID },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the updated user data excluding the password
        const userResponse = {
            _id: updatedUser._id,
            userID: updatedUser.userID,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            username: updatedUser.username,
            userType: updatedUser.userType,
            profilePic: updatedUser.profilePic, // Include updated profilePic
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };

        res.status(200).json({ message: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        // Check if user already exists
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user instance
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        // Save new user to the database
        await newUser.save();

        return res.status(201).json({ success: true, message: "Registered successfully, you can now log in" });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.login = async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Passwords don't match" });
        }

        return res.status(200).json({ success: true, message: "Logged in successfully" });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
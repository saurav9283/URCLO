const bcrypt = require('bcrypt');
const { getUserByEmail, getUserByPhone, saveUser } = require('../userAuth/auth.service');
const { sendEmail } = require('../../services/email-service');
const { sendSms } = require('../../services/sms-service');

module.exports = {
    register: async (req, res) => {
        try {
            const { name, email, phone, password, provider } = req.body;

            // Validate input
            if (!name || (!email && !phone) || !password) {
                return res.status(400).json({ msg: "All fields are required" });
            }

            // Check if user exists by email
            const emailExists = await new Promise((resolve, reject) => {
                getUserByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });

            if (emailExists) {
                return res.status(400).json({ msg: "User already exists with this email" });
            }

            // Check if user exists by phone
            const phoneExists = await new Promise((resolve, reject) => {
                getUserByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });

            if (phoneExists) {
                return res.status(400).json({ msg: "User already exists with this phone" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000);

            let userProvider;
            if (provider === 'email') {
                userProvider = 'email';
            }
            else if(provider === 'phone') {
                userProvider = 'phone';
            }
            else if (provider === 'google') {
                userProvider = 'Google';
            }
            else if (provider === 'Facebook') {
                userProvider = 'Facebook';
            }
            else if (provider === 'Apple') {
                userProvider = 'Apple';
            }
            else {
                return res.status(400).json({ msg: "Invalid provider" });
            }
            // Save the user to the database
            const newUser = {
                name,
                email: email ? email : null,
                phone: phone ? phone : null,
                password: hashedPassword,
                provider: userProvider,
                otp: otp,
            };

            saveUser(newUser, (err, result) => {
                if (err) {
                    console.error("Error saving user:", err);
                    return res.status(500).json({ msg: "Internal server error" });
                }
                return res.status(201).json({ msg: result });
               
               
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
};

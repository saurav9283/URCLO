const bcrypt = require('bcrypt');
const { getUserByEmail, getUserByPhone, saveUser, checkRegisteredUser, OtpVerify, checkRegisteredUserWithPhone } = require('../userAuth/auth.service');
const { sendEmail } = require('../../services/email-service');
const { sendSms } = require('../../services/sms-service');
const { verifyGoogleToken } = require('../../services/oAuth');

module.exports = {
    register: async (req, res) => {
        try {
            const { name, email, phone, password, provider } = req.body;

            if (!provider) {
                return res.status(400).json({ msg: "Provider is required" });
            }
            // Validate input
            if (!name || (!email && !phone)) {
                return res.status(400).json({ msg: "All fields are required" });
            }

            // if (provider === 'google') {
            //     if (!idToken) {
            //         return res.status(400).json({ msg: "Google ID token is required" });
            //     }

            //     // Verify Google ID token
            //     const googlePayload = await verifyGo2ogleToken(idToken);
            //     email = googlePayload.email;
            //     name = googlePayload.name;
            //     userProvider = 'Google';
            // }
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
            else if (provider === 'phone') {
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
                password: hashedPassword ? hashedPassword : null,
                provider: userProvider,
                otp: otp ? otp : null,
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

    verifyEmailOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;

            // Validate input
            if (!email || !otp) {
                return res.status(400).json({ msg: "Email and OTP are required" });
            }

            // Check if user exists by email
            const user = await new Promise((resolve, reject) => {
                getUserByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0 ? result[0] : null);
                });
            });

            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }

            if (user.otp !== otp) {
                return res.status(400).json({ msg: "Invalid OTP" });
            }

            // Update the user's status to verified
            user.isVerified = 1;

            OtpVerify(user, (err, result) => {
                if (err) {
                    console.error("Error saving user:", err);
                    return res.status(500).json({ msg: "Internal server error" });
                }
                return res.status(200).json({ msg: "Email verified successfully" });
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    verifyPhoneOtp: async (req, res) => {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ msg: "Phone and OTP are required" });
        }
        const user = await new Promise((resolve, reject) => {
            getUserByPhone(phone, (err, result) => {
                if (err) reject(err);
                resolve(result && result.length > 0 ? result[0] : null);
            });
        });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }
        user.isVerified = 1;
        OtpVerifyPhone(user, (err, result) => {
            if (err) {
                console.error("Error saving user:", err);
                return res.status(500).json({ msg: "Internal server error" });
            }
            return res.status(200).json({ msg: "Phone verified successfully" });
        });
    },
    resendEmailOtp: async (req, res) => {
        try {
            const { email } = req.body;

            // Validate input
            if (!email) {
                return res.status(400).json({ msg: "Email is required" });
            }

            // Check if user exists by email
            const user = await new Promise((resolve, reject) => {
                getUserByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0 ? result[0] : null);
                });
            });


            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000);

            // Save the new OTP
            user.otp = otp;

            checkRegisteredUser(user, (err, result) => {
                if (err) {
                    console.error("Error saving user:", err);
                    return res.status(500).json({ msg: "Internal server error" });
                }
                const payload = {
                    from: process.env.MAIL_SENDER_EMAIL,
                    to: email,
                    subject: 'OTP for email verification',
                    template: `emailotp.ejs`,
                    data: {
                        name: user.name,
                        otp: otp,
                    },
                }
                sendEmail(payload)
                    .then(info => {
                        return res.status(200).json({ msg: "OTP re-sent successfully" });
                    })
                    .catch(error => {
                        console.error("Error sending email:", error);
                        return res.status(500).json({ msg: "Internal server error" });
                    });
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    resendPhoneOtp: async (req, res) => {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ msg: "Phone is required" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        await new Promise((resolve, reject) => {
            checkRegisteredUserWithPhone(user, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        return res.status(200).json({ msg: "OTP re-sent successfully" });

    },
};

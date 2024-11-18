const pool = require('../../config/database');
const { sendEmail } = require('../../services/email-service');
const moment = require('moment');
const { sendSms } = require('../../services/sms-service');
module.exports = {
    getUserByEmail: (email, callback) => {
        const query = process.env.CHECKEXISTINGEMAIL.replace('<email>', email);
        pool.query(query, (err, result) => {
            if (err) {
                console.error("Error checking email:", err);
                return callback(err);
            }
            return callback(null, result);
        });

    },
    getUserByPhone: (phone, callback) => {
        const query = process.env.CHECKEXISTINGPHONE.replace('<phone>', phone);
        pool.query(query, (err, result) => {
            if (err) {
                console.error("Error checking phone:", err);
                return callback(err);
            }
            return callback(null, result);
        });
    },
    saveUser: async (newUser, callback) => {
        if (newUser.phone) {
            
            try {
                await sendSms(newUser.phone, `Your OTP for registration is ${newUser.otp}`);
            } catch (error) {
                console.error("Error sending email:", error.message);
                return res.status(500).json({ msg: "Failed to send OTP email. Registration aborted." });
            }
        }
        else if (newUser.email) {
            const payload = {
                from: process.env.MAIL_SENDER_EMAIL,
                to: newUser.email,
                subject: 'OTP for registration',
                template: `emailotp.ejs`,
                data: {
                    name: newUser.name,
                    otp: newUser.otp,
                },
            }
            console.log(payload, "payload=-=-")
            try {
                await sendEmail(payload);
            } catch (error) {
                console.error("Error sending email:", error.message);
                return res.status(500).json({ msg: "Failed to send OTP email. Registration aborted." });
            }
        }
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

        const query = process.env.SAVEUSER
            .replace('<name>', newUser.name)
            .replace('<email>', newUser.email)
            .replace('<phone>', newUser.phone)
            .replace('<password>', newUser.password)
            .replace('<provider>', newUser.provider)
            .replace('<createdon>', currentDateTime)
            .replace('<isVerified>', 0)
            .replace('<otp>', newUser.otp)
            .replace('<otpExpires>', otpExpires)
        console.log(query)

        pool.query(query, (err, result) => {
            if (err) {
                console.error("Error saving user:", err);
                return callback(err);
            }
            return callback(null, "Otp sent successfully on registered email");
        });
    }
}
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
            // console.log(payload, "payload=-=-")
            try {
                await sendEmail(payload);
            } catch (error) {
                console.error("Error sending email:", error.message);
                return res.status(500).json({ msg: "Failed to send OTP email. Registration aborted." });
            }
        }
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

        let checkVerifyUser = 0;
        if(newUser.provider === 'Google')
        {
            checkVerifyUser = 1;
        }

        const query = process.env.SAVEUSER
            .replace('<name>', newUser.name)
            .replace('<email>', newUser.email)
            .replace('<phone>', newUser.phone)
            .replace('<password>', newUser.password)
            .replace('<provider>', newUser.provider)
            .replace('<createdon>', currentDateTime)
            .replace('<isVerified>', checkVerifyUser)
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
    },
    checkRegisteredUser: async (newUser, callback) => {
        try {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

            const getidQuery = process.env.GETID.replace('<email>', newUser.email);
            console.log('getidQuery: ', getidQuery);

            pool.query(getidQuery, (err, result) => {
                if (err) {
                    console.error("Error retrieving user ID:", err);
                    return callback(err);
                }

                const userId = result[0].id;

                const updateQuery = process.env.UPDATE_SAVEUSER
                    .replace('<name>', newUser.name)
                    .replace('<email>', newUser.email)
                    .replace('<phone>', newUser.phone)
                    .replace('<password>', newUser.password)
                    .replace('<provider>', newUser.provider)
                    .replace('<createdon>', currentDateTime)
                    .replace('<isVerified>', 0)
                    .replace('<otp>', newUser.otp)
                    .replace('<otpExpires>', otpExpires)
                    .replace('<id>', userId);

                console.log(updateQuery);

                pool.query(updateQuery, (err, result) => {
                    if (err) {
                        console.error("Error updating user:", err);
                        return callback(err);
                    }
                    return callback(null, "Otp sent successfully on registered email");
                });
            });
        } catch (error) {
            console.error("Error in checkRegisteredUser:", error.message);
            return callback(error);
        }
    },
    OtpVerify: (user, callback) => {
        const getid = process.env.GETID.replace('<email>', user.email);
        console.log('getid: ', getid);


        pool.query(getid, (err, result) => {
            if (err) {
                console.error("Error retrieving user ID:", err);
                return callback(err);
            }

            const user = result[0];
            console.log('user: ', user);
            if (user.otpExpires < moment().format('YYYY-MM-DD HH:mm:ss')) {
                return callback(null, "OTP expired");
            }
            const updateToVerifyUser = process.env.UPDATE_VERIFYUSER
                .replace('<id>', user.id)
                .replace('<isVerified>', 1);
            pool.query(updateToVerifyUser, (err, result) => {
                if (err) {
                    console.error("Error updating user:", err);
                    return callback(err);
                }
                return callback(null, "Email verified successfully");
            });

        });
    },
    OtpVerifyPhone: (user, callback) => {
        const getid_for_phone = process.env.GETID.replace('<phone>', user.phone);
        console.log('getid: ', getid);

        pool.query(getid_for_phone, (err, result) => {
            if (err) {
                console.error("Error retrieving user ID:", err);
                return callback(err);
            }

            const user = result[0];
            console.log('user: ', user);
            if (user.otpExpires < moment().format('YYYY-MM-DD HH:mm:ss')) {
                return callback(null, "OTP expired");
            }
            const updateToVerifyUser = process.env.UPDATE_VERIFYUSER
                .replace('<id>', user.id)
                .replace('<isVerified>', 1);
            pool.query(updateToVerifyUser, (err, result) => {
                if (err) {
                    console.error("Error updating user:", err);
                    return callback(err);
                }
                return callback(null, "Phone verified successfully");
            });

        });
    },
    checkRegisteredUserWithPhone: async (newUser, callback) => {
        try {
            if (newUser.phone) {
                await sendSms(newUser.phone, `Your resend OTP for registration is ${newUser.otp}`);
            } else if (newUser.email) {
                const payload = {
                    from: process.env.MAIL_SENDER_EMAIL,
                    to: newUser.email,
                    subject: 'OTP for registration',
                    template: `emailotp.ejs`,
                    data: {
                        name: newUser.name,
                        otp: newUser.otp,
                    },
                };
                console.log(payload, "payload=-=-");
                await sendEmail(payload);
            }

            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

            const getidQuery = process.env.getid_for_phone.replace('<phone>', newUser.phone);
            console.log('getidQuery: ', getidQuery);

            pool.query(getidQuery, (err, result) => {
                if (err) {
                    console.error("Error retrieving user ID:", err);
                    return callback(err);
                }

                const userId = result[0].id;

                const updateQuery = process.env.UPDATE_SAVEUSER
                    .replace('<name>', newUser.name)
                    .replace('<email>', newUser.email)
                    .replace('<phone>', newUser.phone)
                    .replace('<password>', newUser.password)
                    .replace('<provider>', newUser.provider)
                    .replace('<createdon>', currentDateTime)
                    .replace('<isVerified>', 0)
                    .replace('<otp>', newUser.otp)
                    .replace('<otpExpires>', otpExpires)
                    .replace('<id>', userId);

                console.log(updateQuery);

                pool.query(updateQuery, (err, result) => {
                    if (err) {
                        console.error("Error updating user:", err);
                        return callback(err);
                    }
                    return callback(null, "Otp sent successfully on registered Number");
                });
            });
        } catch (error) {
            console.error("Error in checkRegisteredUser:", error.message);
            return callback(error);
        }
    },
}
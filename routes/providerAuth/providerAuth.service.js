const pool = require('../../config/database');
const { sendSms } = require('../../services/sms-service.js');
const { sendEmail } = require('../../services/email-service');
const moment = require('moment');

module.exports = {
    getProviderByEmail: async (email, callback) => {
        const provider_email = process.env.CHECKEXISTINGEMAIL_PROVIDER.replace('<email>', email);
        pool.query(provider_email, (err, result) => {
            if (err) {
                console.error("Error checking email:", err);
                return callback(err);
            }
            return callback(null, result);
        });
    },
    getProviderByPhone: async (phone, callback) => {
        const provider_phone = process.env.CHECKEXISTINGPHONE_PROVIDER.replace('<phone>', phone);
        pool.query(provider_phone, (err, result) => {
            if (err) {
                console.error("Error checking phone:", err);
                return callback(err);
            }
            return callback(null, result);
        });
    },
    saveProvider: async (newProvider, callback) => {
        if (newProvider?.phone) {
            try {
                console.log("-=-=-=")
                await sendSms(newProvider.phone, `Your OTP for registration is ${newProvider.otp}`);
            } catch (error) {
                console.error("Error sending email:", error.message);
                return callback(error);
            }
        }
        if (newProvider.email) {
            const payload = {
                from: process.env.MAIL_SENDER_EMAIL,
                to: newProvider.email,
                subject: 'OTP for registration',
                template: `emailotp.ejs`,
                data: {
                    name: newProvider.name,
                    otp: newProvider.otp,
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

        let checkVerifyUser = 0;
        const query = process.env.SAVE_PROVIDER
            .replace('<name>', newProvider.name)
            .replace('<age>', newProvider.age)
            .replace('<DOB>', newProvider.DOB)
            .replace('<servicename>', newProvider.servicename)
            .replace('<phone>', newProvider.phone)
            .replace('<email>', newProvider.email)
            .replace('<address>', newProvider.address)
            .replace('<availableTime>', newProvider.availableTime)
            .replace('<documentNumber>', newProvider.documentNumber)
            .replace('<documentType>', newProvider.documentType)
            .replace('<password>', newProvider.password)
            .replace('<otp>', newProvider.otp)
            .replace('<otpExpires>', otpExpires)
            .replace('<createdon>', currentDateTime)
            .replace('<isVerified>', checkVerifyUser);

        console.log(query, "query=-=-")
        pool.query(query, (err, result) => {
            if (err) {
                console.error("Error saving user:", err);
                return callback(err);
            }
            return callback(null, `OTP sent to your registered  email or phone number`);
        });

    },
    UpdateVerifyProvider: async (provider, callback) => {
        const getproviderId = process.env.GET_PROVIDERID.replace('<email>', provider.email);
        console.log('getproviderId: ', getproviderId);

        pool.query(getproviderId, (err, result) => {
            if (err) {
                console.error("Error getting provider id:", err);
                return callback(err);
            }
            const providerId = result[0].id;
            console.log('providerId: ', providerId);

            const updateProvider = process.env.UPDATE_PROVIDER.replace('<providerId>', providerId)
            .replace('<isVerified>', provider.isVerified);
            console.log('updateProvider: ', updateProvider);

            pool.query(updateProvider, (err, result) => {
                if (err) {
                    console.error("Error updating provider:", err);
                    return callback(err);
                }
                return callback(null, result);
            });
        });
    },
}
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
            .replace('<masterId>', newProvider.masterId)
            .replace('<cat_id>' , newProvider.cat_id)
            .replace('<sub_cat_id>' , newProvider.subcat_id)
            .replace('<phone>', newProvider.phone ? newProvider.phone : null)
            .replace('<email>', newProvider.email ? newProvider.email : null)
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
    UpdateOTP: async (provider, callback) => {
        if (provider.email) {
            sendEmail({
                from: process.env.MAIL_SENDER_EMAIL,
                to: provider.email,
                subject: 'OTP for registration',
                template: `emailotp.ejs`,
                data: {
                    name: provider.name,
                    otp: provider.otp,
                },
            });
            const getproviderId = process.env.GET_PROVIDERID.replace('<email>', provider.email);
            console.log('getproviderId: ', getproviderId);

            pool.query(getproviderId, (err, result) => {
                if (err) {
                    console.error("Error getting provider id:", err);
                    return callback(err);
                }
                const providerId = result[0].id;
                console.log('providerId: ', providerId);

                const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

                const updateProvider = process.env.UPDATE_OTP.replace('<providerId>', providerId)
                    .replace('<otp>', provider.otp)
                    .replace('<otpExpires>', otpExpires)
                console.log('updateProvider: ', updateProvider);

                pool.query(updateProvider, (err, result) => {
                    if (err) {
                        console.error("Error updating provider:", err);
                        return callback(err);
                    }
                    return callback(null, "OTP re-sent successfully");
                });
            });
        }
        else if (provider.phone) {
            const getproviderId = process.env.GET_PROVIDERID.replace('<phone>', provider.phone);
            console.log('getproviderId: ', getproviderId);

        }
    },
    UpdateOTPBy_Number: async (provider, callback) => {
        sendSms(provider.phone, `Your OTP for registration is ${provider.otp}`);
        const getproviderId = process.env.GET_PROVIDERID_PHONE.replace('<phone>', provider.phone);
        console.log('getproviderId: ', getproviderId);

        pool.query(getproviderId, (err, result) => {
            if (err) {
                console.error("Error getting provider id:", err);
                return callback(err);
            }
            const providerId = result[0].id;
            console.log('providerId: ', providerId);

            const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

            const updateProvider = process.env.UPDATE_OTP.replace('<providerId>', providerId)
                .replace('<otp>', provider.otp)
                .replace('<otpExpires>', otpExpires)
            console.log('updateProvider: ', updateProvider);

            pool.query(updateProvider, (err, result) => {
                if (err) {
                    console.error("Error updating provider:", err);
                    return callback(err);
                }
                return callback(null, "OTP re-sent successfully");
            });
        });
    },
    updateProviderPassword: (provider, newPassword) => {
        return new Promise((resolve, reject) => {
            console.log('provider: ', provider);
            const GETTid = process.env.GET_PROVIDER_ID.replace('<id>', provider);
            console.log('GETTid: ', GETTid);

            pool.query(GETTid, (err, result) => {
                if (err) {
                    console.error("Error retrieving user ID:", err);
                    return reject(err);
                }

                const user = result[0];
                console.log('user: ', user);
                const updatePasswordQuery = process.env.UPDATE_PASSWORD_PROVIDER
                    .replace('<id>', user.id)
                    .replace('<password>', newPassword); // Use newPassword here

                pool.query(updatePasswordQuery, (err, result) => {
                    if (err) {
                        console.error("Error updating user:", err);
                        return reject(err);
                    }
                    return resolve("Password updated successfully");
                });
            });
        });
    }
}
const pool = require('../../../config/database');
const moment = require('moment');
const { signIn } = require('../../../lib/web.notification.type');

module.exports = {
    notificationService: async (userId, userName) => {
        // console.log('userId: ', userId);
        // console.log('signIn: ', signIn);

        // Replace placeholder with actual user name
        const signInSMS = signIn.sms.replace('[User Name]', userName);
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

        try {
            const payload = {
                userId,
                content: signInSMS,
                content_code: signIn.code,
                type: 'signIn',
                createdon: currentDateTime,
            };

            const query = process.env.INSERT_SIGN_IN_SMS
                .replace('<user_id>', payload.userId)
                .replace('<content>', payload.content)
                .replace('<content_code>', payload.content_code)
                .replace('<type>', payload.type)
                .replace('<createdon>', payload.createdon);

            return new Promise((resolve, reject) => {
                pool.query(query, (error, results) => {
                    if (error) {
                        console.error('Error:', error);
                        return reject(error);
                    }
                    return resolve(results);
                });
            });
        } catch (error) {
            console.error("Notification service error:", error);
            throw error;
        }
    },
    getNotifisationForUser: async (email, phone, callback) => {
        try {
            if (!email && !phone) {
                return callback('Please provide email or phone number', null);
            }
            if (email) {
                const getuserId = process.env.GET_NOTIFICATION_FOR_USER_EMAIL.replace('<email>', email);
                console.log('getuserId: ', getuserId);
                pool.query(getuserId, (err, result) => {
                    if (err) {
                        console.error('Error:', err);
                        return callback(err, null);
                    }
                    const userId = result[0].id;
                    const getNotification = process.env.GET_NOTIFICATION_FOR_USER_ID.replace('<userId>', userId);
                    console.log('getNotification: ', getNotification);
                    pool.query(getNotification, (err, result) => {
                        if (err) {
                            console.error('Error:', err);
                            return callback(err, null);
                        }
                        return callback(null, result);
                    });
                });

            }
            if (phone) {
                const getuserId = process.env.GET_NOTIFICATION_FOR_USER_PHONE.replace('<phone>', phone);
                console.log('getuserId: ', getuserId);
                pool.query(getuserId, (err, result) => {
                    if (err) {
                        console.error('Error:', err);
                        return callback(err, null);
                    }
                    const userId = result[0].id;
                    const getNotification = process.env.GET_NOTIFICATION_FOR_USER_ID.replace('<userId>', userId);
                    console.log('getNotification: ', getNotification);
                    pool.query(getNotification, (err, result) => {
                        if (err) {
                            console.error('Error:', err);
                            return callback(err, null);
                        }
                        return callback(null, result);
                    });
                });
            }
        } catch (error) {
            console.error("Notification service error:", error);
            throw error;
        }
    },
    getCountNotify: async (user_id, callback) => {
        try {
            if (!user_id) {
                return callback('Please provide user id', null);
            }
            const getCountNotify = process.env.GET_COUNT_NOTIFY.replace('<user_id>', user_id);
            console.log('getCountNotify: ', getCountNotify);
            pool.query(getCountNotify, (err, result) => {
                if (err) {
                    console.error('Error:', err);
                    return callback(err, null);
                }
                return callback(null, result);
            });
        } catch (error) {
            console.error("Notification service error:", error);
            throw error;
        }
    }
};

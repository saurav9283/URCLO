const pool = require("../../../config/database");
const moment = require('moment');
const { appointmentSchedule } = require('../../../lib/web.notification.type');

module.exports = {
    providerNotifyService : async (user_id,providerId ) => {
        // console.log('providerId,user_id: ', providerId,user_id);
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const providerSMS = appointmentSchedule.schedule.replace('[Date and Time]', currentDateTime);

        try {
            const payload = {
                providerId,
                user_id,
                content: providerSMS,
                code: appointmentSchedule.code,
                type: appointmentSchedule.type,
                createdon: currentDateTime,
            };

            const query = process.env.INSERT_PROVIDER_SMS
                .replace('<provider_id>', payload.providerId)
                .replace('<user_id>', payload.user_id)
                .replace('<content>', payload.content)
                .replace('<code>', payload.code)
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
            console.error("Provider Notification service error:", error);
            throw error;
        }
    },
}
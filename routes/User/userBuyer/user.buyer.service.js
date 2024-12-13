const pool = require("../../../config/database");
const moment = require('moment');

module.exports = {
    UserBuyerService: (user_id, sub_cat_id, provider_id, quantity, schedule_time, callback) => {
        console.log('schedule_time: ', schedule_time); 
        try {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

            const fetchAvailableTimeQuery = process.env.fetchAvailableTimeQuery
                .replace('<providerId>', provider_id)
                .replace('<sub_cat_id>', sub_cat_id);
            console.log('fetchAvailableTimeQuery: ', fetchAvailableTimeQuery);

            pool.query(fetchAvailableTimeQuery, (err, fetchResult) => {
                if (err) {
                    console.log("Error fetching availableTime: ", err);
                    return callback(err);
                }
                console.log('fetchResult.length: ', fetchResult.length);
                if (fetchResult.length === 0) {
                    return callback(null, "No available time found");
                }

                let availableTimeString = fetchResult[0]?.availableTime;
                availableTimeString = availableTimeString.replace(/([{\[,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
                let availableTime;

                try {
                    availableTime = JSON.parse(availableTimeString);
                } catch (parseError) {
                    console.log("Error parsing availableTime: ", parseError);
                    return callback(parseError);
                }

                // Check if the provider is already busy at the specified date and time
                const isBusy = schedule_time.some(schedule => {
                    return availableTime.some(slot => slot.date === schedule.date && slot.startDateTime === schedule.startDateTime && slot.state === 1);
                });

                if (isBusy) {
                    return callback(null, "Provider is already busy at the specified time");
                }

                // Update the state for the specified date and time
                schedule_time.forEach(schedule => {
                    availableTime = availableTime.map(slot => {
                        if (slot.date === schedule.date && slot.startDateTime === schedule.startDateTime) {
                            slot.state = 1;
                        }
                        return slot;
                    });
                });

                const updatedAvailableTime = JSON.stringify(availableTime);
                const provider_make_busy = process.env.PROVIDER_MAKE_BUSY
                    .replace('<availableTime>', updatedAvailableTime)
                    .replace('<providerId>', provider_id)
                    .replace('<sub_cat_id>', sub_cat_id);

                pool.query(provider_make_busy, (err, updateResult) => {
                    if (err) {
                        console.log("Error updating availableTime: ", err);
                        return callback(err);
                    }

                    // Use parameterized query to avoid SQL injection
                    const create_order = process.env.CREATE_ORDER
                        .replace('<user_id>', user_id)
                        .replace('<sub_cat_id>', sub_cat_id)
                        .replace('<provider_id>', provider_id)
                        .replace('<quantity>', quantity)
                        .replace('<createdon>', currentDateTime)
                        .replace('<schedule_time>', JSON.stringify(schedule_time))
                        .replace('<IsserviceDone>', 0)
                        .replace('<serviceStartTime>', null)
                        .replace('<serviceEndTime>', null)
                        .replace('<Acceptance_Status>', 0)
                        .replace('<Payment_Status>', 0);

                    console.log('create_order: ', create_order);

                    pool.query(create_order, (err, result) => {
                        if (err) {
                            console.log("Error during database query: ", err);
                            return callback(err);
                        }

                        return callback(null, result);
                    });
                }); 
            });
        } catch (error) {
            console.log('Error: ', error);
            return callback(error);
        }
    },
    DeletebuyerRecode: (user_id, sub_cat_id, provider_id, callback) => {
        try {
            const deleteOrderQuery = process.env.DELETE_ORDER_QUERY
                .replace('<user_id>', user_id)
                .replace('<sub_cat_id>', sub_cat_id)
                .replace('<provider_id>', provider_id);

            pool.query(deleteOrderQuery, (err, result) => {
                if (err) {
                    console.log("Error deleting order: ", err);
                    return callback(err);
                }

                return callback(null, result);
            });
        } catch (error) {
            console.log('Error: ', error);
            return callback(error);
        }
    }
}; 
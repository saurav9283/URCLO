const pool = require("../../../config/database");
const moment = require('moment');

module.exports = {
    UserBuyerService: (user_id, sub_cat_id, provider_id, quantity, schedule_time, schedule_date, user_address, callback) => {
        console.log('schedule_time: ', schedule_time);
        try {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const clear_cart = process.env.CLEAR_CART_QUERY
                .replace('<user_id>', user_id);
            console.log('clear_cart: ', clear_cart);

            const create_order = process.env.CREATE_ORDER
                .replace('<user_id>', user_id)
                .replace('<sub_cat_id>', sub_cat_id)
                .replace('<provider_id>', provider_id)
                .replace('<quantity>', quantity)
                .replace('<createdon>', currentDateTime)
                .replace('<schedule_time>', schedule_time)
                .replace('<schedule_date>', schedule_date)
                .replace('<IsserviceDone>', 0)
                .replace('<serviceStartTime>', null)
                .replace('<serviceEndTime>', null)
                .replace('<Acceptance_Status>', 0)
                .replace('<Payment_Status>', 0)
                .replace('<user_address>', user_address);

            console.log('create_order: ', create_order);

            pool.query(create_order, (err, result) => {
                if (err) {
                    console.log("Error during database query: ", err);
                    return callback(err);
                }
                if (result.affectedRows === 0) {
                    return callback({ message: "Failed to create order" });
                }
                else {
                    pool.query(clear_cart, (err, deleteresult) => {
                        if (err) {
                            console.log("Error during database query: ", err);
                            return callback(err);
                        }
                        return callback(null, result);
                    })
                }

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
    },

    UserBookingDetailsService: (user_id, callback) => {
        try {
            const userBookingDetailsQuery = process.env.USER_BOOKING_DETAILS_QUERY
                .replace('<user_id>', user_id);

            pool.query(userBookingDetailsQuery, (err, result) => {
                if (err) {
                    console.log("Error fetching user booking details: ", err);
                    return callback(err);
                }
                if (result[0]?.email) {
                    return callback(null, result[0].email);
                }
                else if (result[0]?.phone) {
                    return callback(null, result[0].phone);
                }
            });
        } catch (error) {
            console.log('Error: ', error);
            return callback(error);
        }
    }
}; 
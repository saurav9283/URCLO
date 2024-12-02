const pool = require("../../../config/database");
const moment = require('moment');

module.exports = {
    UserBuyerService: (user_id, sub_cat_id, provider_id,quantity, callback) => {
        // console.log('user_id, sub_cat_id, provider_id,quantity: ', user_id, sub_cat_id, provider_id,quantity);
        try {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            // Use parameterized query to avoid SQL injection
            const create_order = process.env.CREATE_ORDER
            .replace('<user_id>', user_id)
            .replace('<sub_cat_id>', sub_cat_id)
            .replace('<provider_id>', provider_id)
            .replace('<quantity>', quantity)
            .replace('<createdon>', currentDateTime);
            
            console.log('create_order: ', create_order);
            pool.query(create_order, (err, result) => {
                if (err) {
                    console.log("Error during database query: ", err);
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

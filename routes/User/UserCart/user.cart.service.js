const pool = require("../../../config/database");
const moment = require('moment');

module.exports = {
    AddToCartService: async (user_id, masterId, cat_id, sub_cat_id, quantity, callback) => {
        console.log('user_id, masterId, cat_id, sub_cat_id, quantity: ', user_id, masterId, cat_id, sub_cat_id, quantity);
        try {
            const checkQuantity = process.env.CHECK_QTY_CART.replace('<sub_cat_id>', sub_cat_id)
                .replace('<user_id>', user_id);
            console.log('checkQuantity: ', checkQuantity);

            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            pool.query(checkQuantity, (err, result) => {
                if (err) {
                    console.error("Error checking quantity:", err.message);
                    return callback(err);
                }
                console.log('result: ', result);
                if (result[0]?.quantity >= 0) {
                    const currentQuantity = result[0].quantity;

                    const newQuantity = currentQuantity + 1;
                    const updateQuantity = process.env.UPDATE_QTY_CART
                        .replace('<sub_cat_id>', sub_cat_id)
                        .replace('<user_id>', user_id)
                        .replace('<quantity>', newQuantity)
                        .replace('<masterId>', masterId)
                        .replace('<cat_id>', cat_id);
                    console.log('updateQuantity: ', updateQuantity);
                    pool.query(updateQuantity, (err, result) => {
                        if (err) {
                            console.error("Error while adding to cart +", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is on card.");
                    });
                } else {
                    const addToCart = process.env.ADD_TO_CART.replace('<user_id>', user_id)
                        .replace('<sub_cat_id>', sub_cat_id).replace('<quantity>', quantity).replace('<masterId>', masterId).replace('<cat_id>', cat_id)
                        .replace('<createdon>', currentDateTime);
                    console.log('addToCart: ', addToCart);
                    pool.query(addToCart, (err, result) => {
                        if (err) {
                            console.error("Error adding to cart:", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is on card.");
                    });
                }
            });

        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },
    RemoveFromCartService: async (user_id, masterId, cat_id, sub_cat_id, callback) => {
        try {
            const checkQuantity = process.env.CHECK_QTY_CART.replace('<sub_cat_id>', sub_cat_id)
                .replace('<user_id>', user_id);
            console.log('checkQuantity: ', checkQuantity);

            pool.query(checkQuantity, (err, result) => {
                if (err) {
                    console.error("Error checking quantity:", err.message);
                    return callback(err);
                }
                // console.log('result:=-=- ', result);

                if (result[0]?.quantity > 0) {
                    const currentQuantity = result[0].quantity;
                    const newQuantity = currentQuantity - 1;
                    const deleteFromCart = process.env.DELETE_FROM_CART.replace('<sub_cat_id>', sub_cat_id)
                        .replace('<user_id>', user_id).replace('<quantity>', newQuantity).replace('<masterId>', masterId).replace('<cat_id>', cat_id);
                    console.log('deleteFromCart: ', deleteFromCart);
                    pool.query(deleteFromCart, (err, result) => {
                        if (err) {
                            console.error("Error while removing from cart +", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is removed from cart.");
                    });
                } else {
                    return callback(null, "No item found in cart.");
                }
            });
        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },
    GetCartService: async (user_id, callback) => {
        try {
            const getCart = process.env.GET_CART.replace('<user_id>', user_id);
            console.log('getCart: ', getCart);
            pool.query(getCart, (err, result) => {
                if (err) {
                    console.error("Error getting cart:", err.message);
                    return callback(err);
                }
                console.log('result: ', result);
                const subCatIds = result.map(row => row.sub_cat_id);
                console.log('subCatIds:', subCatIds);

                if (subCatIds.length === 0) {
                    return callback(null, { message: "Your Cart is Empty" });
                }
                const formattedSubCatIds = subCatIds.map(id => `'${id}'`).join(',');
                const subCatQuery = process.env.GET_SUB_CAT_DETAILS
                .replace('<sub_cat_id>', formattedSubCatIds);
                
                console.log('subCatQuery: ', subCatQuery);
                pool.query(subCatQuery, [subCatIds], (err, subCatResult) => {
                    if (err) {
                        console.error("Error fetching from tbl_cart:", err.message);
                        return callback(err);
                    }
                    console.log('subCatResult: ', subCatResult);

                    // Format and send the response

                    callback(null, subCatResult);
                });

            });

        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    }
}
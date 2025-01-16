const pool = require("../../../config/database");
const moment = require('moment');

module.exports = {
    AddToCartService: async (user_id, provider_id, masterId, cat_id, sub_cat_id, quantity,price,booking_date, callback) => {
        console.log('user_id, masterId, cat_id, sub_cat_id, quantity: ', user_id, masterId, cat_id, sub_cat_id, quantity);
        try {
            const checkQuantity = process.env.CHECK_QTY_CART.replace('<sub_cat_id>', sub_cat_id)
                .replace('<user_id>', user_id).replace('<provider_id>', provider_id)
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
                        .replace('<cat_id>', cat_id)
                        .replace('<provider_id>', provider_id);

                    console.log('updateQuantity: ', updateQuantity);
                    pool.query(updateQuantity, (err, result) => {
                        if (err) {
                            console.error("Error while adding to cart +", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is on card.", newQuantity);
                    });
                } else {
                    const addToCart = process.env.ADD_TO_CART.replace('<user_id>', user_id)
                        .replace('<sub_cat_id>', sub_cat_id).replace('<quantity>', quantity).replace('<masterId>', masterId).replace('<cat_id>', cat_id)
                        .replace('<createdon>', currentDateTime).replace('<provider_id>', provider_id).replace('<price>', price).replace('<booking_date>', booking_date);
                    console.log('addToCart: ', addToCart);
                    pool.query(addToCart, (err, result) => {
                        if (err) {
                            console.error("Error adding to cart:", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is on card.", quantity);
                    });
                }
            });

        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },
    RemoveFromCartService: async (user_id, provider_id, masterId, cat_id, sub_cat_id, callback) => {
        try {
            const checkQuantity = process.env.CHECK_QTY_CART.replace('<sub_cat_id>', sub_cat_id)
                .replace('<user_id>', user_id).replace('<provider_id>', provider_id);
            console.log('checkQuantity: ', checkQuantity);

            pool.query(checkQuantity, (err, result) => {
                if (err) {
                    console.error("Error checking quantity:", err.message);
                    return callback(err);
                }
                // console.log('result:=-=- ', result);

                if (result[0]?.quantity > 1) {
                    const currentQuantity = result[0].quantity;
                    const newQuantity = currentQuantity - 1;
                    const deleteFromCart = process.env.DELETE_FROM_CART.replace('<sub_cat_id>', sub_cat_id)
                        .replace('<user_id>', user_id).replace('<quantity>', newQuantity).replace('<masterId>', masterId).replace('<cat_id>', cat_id).replace('<provider_id>', provider_id);
                    console.log('deleteFromCart: ', deleteFromCart);
                    pool.query(deleteFromCart, (err, result) => {
                        if (err) {
                            console.error("Error while removing from cart +", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is removed from cart.", newQuantity);
                    });
                } 
                else if (result[0]?.quantity === 1) {
                    const deleteFromCart = process.env.DELETE_FROM_CARTLAST.replace('<sub_cat_id>', sub_cat_id)
                        .replace('<user_id>', user_id).replace('<quantity>', 0).replace('<masterId>', masterId).replace('<cat_id>', cat_id).replace('<provider_id>', provider_id);
                    console.log('deleteFromCart: ', deleteFromCart);
                    pool.query(deleteFromCart, (err, result) => {
                        if (err) {
                            console.error("Error while removing from cart +", err.message);
                            return callback(err);
                        }
                        return callback(null, "Your item is removed from cart.", 0);
                    });
                }
                else {
                    return callback(null, "No item found in cart.");
                }
            });
        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },
    // GetCartService: async (user_id, callback) => {
    //     try {
    //         const getCart = process.env.GET_CART.replace('<user_id>', user_id);
    //         console.log('getCart: ', getCart);
    //         pool.query(getCart, (err, result) => {
    //             if (err) {
    //                 console.error("Error getting cart:", err.message);
    //                 return callback(err);
    //             }
    //             console.log('result: ', result);
    //             const subCatIds = result.map(row => row.sub_cat_id);
    //             console.log('subCatIds:', subCatIds);

    //             if (subCatIds.length === 0) {
    //                 return callback(null, { message: "Your Cart is Empty" });
    //             }
    //             const formattedSubCatIds = subCatIds.map(id => `'${id}'`).join(',');
    //             const subCatQuery = process.env.GET_SUB_CAT_DETAILS
    //             .replace('<sub_cat_id>', formattedSubCatIds);

    //             console.log('subCatQuery: ', subCatQuery);
    //             pool.query(subCatQuery, [subCatIds], (err, subCatResult) => {
    //                 if (err) {
    //                     console.error("Error fetching from tbl_cart:", err.message);
    //                     return callback(err);
    //                 }
    //                 console.log('subCatResult: ', subCatResult);

    //                 // Format and send the response

    //                 callback(null, subCatResult);
    //             });

    //         });

    //     } catch (error) {
    //         console.error("Error:", error.message);
    //         callback(error);
    //     }
    // },

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
                // const subCatIds = result.map(row => row.sub_cat_id);
                const subCatIds = result
                    .filter(row => row.quantity >= 1)
                    .map(row => row.sub_cat_id);
                console.log('subCatIds:=-=-=', subCatIds);

                if (subCatIds.length === 0) {
                    return callback(null, { message: "Your Cart is Empty" });
                }

                const formattedSubCatIds = subCatIds.map(id => `'${id}'`).join(',');
                const subCatQuery = process.env.GET_SUB_CAT_DETAILS.replace('<sub_cat_id>', formattedSubCatIds);

                console.log('subCatQuery: ', subCatQuery);

                pool.query(subCatQuery, (err, subCatResult) => {
                    if (err) {
                        console.error("Error fetching from tbl_cart:", err.message);
                        return callback(err);
                    }

                    console.log('subCatResult:=-=-==-= ', subCatResult);

                    const formattedResponse = result.map(cartRow => {
                        const subCatRow = subCatResult.find(row => row.sub_cat_id === cartRow.sub_cat_id);
                        // if(subCatRow === undefined) {
                        //     return callback(null, { message: "No item found in cart." });
                        // }
                        return {
                            masterId: subCatRow?.masterId,
                            cat_id: subCatRow?.cat_id,
                            sub_cat_id: subCatRow?.sub_cat_id,
                            sub_cat_name: subCatRow?.sub_cat_name,
                            standard_price: result[0].price,
                            count: 1,
                            provider_id: cartRow.provider_id,
                            quantity: cartRow.quantity,
                            booking_date: cartRow.booking_date,
                        };
                    });

                    console.log('formattedResponse: ', formattedResponse);

                    callback(null, formattedResponse);
                });
            });

        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },

    GetCountCartService: async (user_id, callback) => {
        try {
            const getCountCart = process.env.GET_COUNT_CART.replace('<user_id>', user_id);
            console.log('getCountCart: ', getCountCart);
            pool.query(getCountCart, (err, result) => {
                if (err) {
                    console.error("Error getting cart count:", err.message);
                    return callback(err);
                }
                console.log('result: ', result);
                callback(null, result);
            });
        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },

    DeleteProductFromCartService: async (user_id, cat_id, sub_cat_id, callback) => {
        console.log('user_id, cat_id, sub_cat_id: ', user_id, cat_id, sub_cat_id);
        try {
            const deleteProductFromCart = process.env.DELETE_PRODUCT_FROM_CART
                .replace('<user_id>', user_id)
                .replace('<sub_cat_id>', sub_cat_id)
                .replace('<cat_id>', cat_id);
            console.log('deleteProductFromCart: ', deleteProductFromCart);
            pool.query(deleteProductFromCart, (err, result) => {
                if (err) {
                    console.error("Error deleting product from cart:", err.message);
                    return callback(err);
                }
                console.log('result: ', result);
                if (result.affectedRows === 0) {
                    return callback(null, "No item found in cart.");
                }
                else if (result.affectedRows > 0) {
                    return callback(null, "Product deleted from cart.");
                }
            });
        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    }
}
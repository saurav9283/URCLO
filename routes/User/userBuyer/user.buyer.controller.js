const { UserBuyerService } = require("./user.buyer.service");
const { providerNotifyService } = require("../../Provider/providerNotify/provider.notify.service");

module.exports = {
    UserBuyerController: async (req, res) => {
        try {
            const { user_id, orders } = req.body;
            console.log('user_id, orders:', user_id, orders);

            // Validate input
            if (!user_id || !Array.isArray(orders) || orders.length === 0) {
                return res.status(400).json({ message: "Invalid input: User ID and orders are required." });
            }

            // Process each order
            const orderPromises = orders?.map(async (order) => {
                const { sub_cat_id, provider_id, quantity,schedule_time } = order;
                console.log('schedule_time: ', schedule_time);
                console.log('Processing order:', sub_cat_id, provider_id, quantity);

                // Validate order details
                if (!sub_cat_id || !provider_id || !quantity) {
                    return Promise.reject({ message: "Invalid order details", order });
                }

                try {
                    // Process order and notify provider
                    const result = await new Promise((resolve, reject) => {
                        UserBuyerService(user_id, sub_cat_id, provider_id, quantity,schedule_time, async (err, result) => {
                            if (err) {
                                console.error("Error processing order:", err);
                                return reject({ message: "Failed to process order", error: err, order });
                            }
                            if (result === "No available time found") {
                                console.log("No available time found for order:", order);
                                return reject({ message: "No available time found", order });
                            }

                            try {
                                await providerNotifyService(user_id, provider_id);
                                return resolve(result);
                            } catch (notifyError) {
                                console.error("Notification error:", notifyError);
                                return reject({
                                    message: "Order processed, but notification failed",
                                    error: notifyError,
                                    order,
                                });
                            }
                        });
                    });

                    return result;
                } catch (error) {
                    console.error("Order processing failed:", error);
                    return Promise.reject(error);
                }
            });
            // Wait for all orders to finish
            const results = await Promise.allSettled(orderPromises);
            console.log('results: ', results);
            if(results[0].status === "rejected"){ 
                return res.status(400).json({ message: "No orders to process" });
            }
            else{
                return res.status(200).json({
                    message: "All services bought successfully"
                });
            }

            // Separate successful and failed orders
            // const successfulOrders = results.filter(r => r.status === "fulfilled").map(r => r.value);
            // const failedOrders = results.filter(r => r.status === "rejected").map(r => r.reason);


            // // Respond with appropriate messages
            // if (failedOrders.length > 0) {
            //     return res.status(207).json({
            //         message: "Partial success: Some orders failed.",
            //         // successfulOrders,
            //         // failedOrders,
            //     });
            // }

            
        } catch (error) {
            console.error("Internal Server Error:", error);
            return res.status(500).json({ message: "Internal Server Error", error });
        }
    },
};

const { AddToCartService, RemoveFromCartService, GetCartService, DeleteProductFromCartService } = require("./user.cart.service");

module.exports = {
    AddToCartController: async (req, res) => {
        try {
            const { user_id,provider_id,masterId,cat_id, sub_cat_id, quantity,price,booking_time,schedule_date } = req.body;
            if (!user_id) {
                return res.status(400).json({ message: "You are not Login" });
            }
            if (!sub_cat_id || !quantity|| !provider_id || !masterId || !cat_id || !price || !booking_time || !schedule_date) {
                return res.status(400).json({ message: "Please provide all the fields" });
            }
            AddToCartService(user_id,provider_id,masterId,cat_id, sub_cat_id, quantity,price,booking_time,schedule_date, (err, result,count) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: result,count });
            });
        } catch (error) {
            console.log('error: ', error
            );
            return res.status(500).json({ message: "Internal Server Error"});
        }
    },
    RemoveFromCartController: async (req, res) => {
        try {
            const { user_id,provider_id, cat_id,masterId ,sub_cat_id } = req.body;
            if (!user_id) {
                return res.status(400).json({ message: "You are not Login" });
            }
            if (!sub_cat_id || !provider_id || !masterId || !cat_id) {
                return res.status(400).json({ message: "Please provide all the fields" });
            }
            RemoveFromCartService(user_id,provider_id,masterId,cat_id, sub_cat_id, (err, result,count) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: result,count });
            });
        } catch (error) {
            console.log('error: ', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    GetCartController: async (req, res) => {
        const { user_id } = req.query;
        console.log('user_id: ', user_id);

        GetCartService(user_id, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({  result });
        });
    },
    GetCOuntCartController: async (req, res) => {
        const { user_id } = req.body;

        // GetCountCartService(user_id, (err, result) => {
        //     if (err) {
        //         return res.status(500).json({ message: "Internal Server Error" });
        //     }
        //     return res.status(200).json({ message: result.length });
        // });
    },
    DeleteProductFromCartController: async (req, res) => {
        const { user_id, cat_id, sub_cat_id } = req.body;
        console.log('req.body: ', req.body);
        if (!user_id) {
            return res.status(400).json({ message: "You are not Login" });
        }
        if (!sub_cat_id || !cat_id) {
            return res.status(400).json({ message: "Please provide all the fields" });
        }
        DeleteProductFromCartService(user_id, cat_id, sub_cat_id, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({ message: result });
        });
    }
}
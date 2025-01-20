const { AddSubPRoviderService, GetSubProviderService, DeleteSubProviderService, GetListSubProviderService } = require("./sub-provider.service.js");

module.exports = {
    AddSubProviderController: async (req, res) => {
        const { providerId, subProoviderName, subProviderAge, subMasterId, subProviderCatId, subProviderSubCatId, sub_providerNumber } = req.body;
        console.log(req.body);
        if (!providerId || !subProoviderName || !subProviderAge || !subMasterId || !subProviderCatId || !subProviderSubCatId || !sub_providerNumber) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        if (subProviderAge < 18 || subProviderAge > 55) {
            return res.status(400).json({ message: "This age group is not legal to work with us." });
        }
        try {
            AddSubPRoviderService(providerId, subProoviderName, subProviderAge, subMasterId, subProviderCatId, subProviderSubCatId, sub_providerNumber, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: data });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    GetSubProviderConteroller: async (req, res) => {
        const { providerId, sub_cat_id } = req.query;
        if (!sub_cat_id || !providerId) {
            return res.status(400).json({ message: "Please provide sub_cat_id" });
        }
        try {
            GetSubProviderService(sub_cat_id, providerId, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                if (data.length === 0) {
                    return res.status(200).json({ message: "No data found" });
                }
                return res.status(200).json({ data });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    DeleteSubProviderController: async (req, res) => {
        const { sub_provider_id } = req.query;
        if (!sub_provider_id) {
            return res.status(400).json({ message: "Please provide sub_provider_id" });
        }
        try {
            DeleteSubProviderService(sub_provider_id, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: data });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    GetListSubProviderController: async (req, res) => {
        const { provider_id } = req.query;
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide provider_id" });
        }
        try {
            GetListSubProviderService(provider_id, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                if (data.length === 0) {
                    return res.status(200).json({ message: "No data found" });
                }
                return res.status(200).json({ data });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
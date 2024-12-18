const { AddSubPRoviderService, GetSubProviderService } = require("./sub-provider.service.js");

module.exports = {
    AddSubProviderController: async (req, res) => {
        const { provideId, subProoviderName, subProviderAge, subMasterId, subProviderCatId, subProviderSubCatId } = req.body;
        console.log(req.body);
        if (!provideId || !subProoviderName || !subProviderAge || !subMasterId || !subProviderCatId || !subProviderSubCatId) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        if (subProviderAge < 18 || subProviderAge > 55) {
            return res.status(400).json({ message: "This age group is not legal to work with us." });
        }
        try {
            AddSubPRoviderService(provideId, subProoviderName, subProviderAge, subMasterId, subProviderCatId, subProviderSubCatId, (err, data) => {
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
        const {provideId,sub_cat_id } = req.query;
        if (!sub_cat_id || !provideId) {
            return res.status(400).json({ message: "Please provide sub_cat_id" });
        }
        try {
            GetSubProviderService(sub_cat_id,provideId, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                if(data.length === 0){
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
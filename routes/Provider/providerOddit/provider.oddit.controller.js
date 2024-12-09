const { ProviderOdditLocationService, ProviderStartingService, ProviderEndService, ProviderOdditAllJobsService } = require("./provider.oddit.service");

module.exports = {
    ProviderOdditController: (req, res) => {
        const { city, scat_id } = req.query;
        console.log(city, scat_id);

        ProviderOdditLocationService(city, scat_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({
                    success: 0,
                    message: "Internal Server Error"
                })
            } else {
                res.status(200).json({ result })
            }
        })
    },

    ProviderStartingController: (req, res) => {
        const { provider_id, scat_id, user_id } = req.body;
        console.log(provider_id, scat_id, user_id);
        ProviderStartingService(provider_id, scat_id, user_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({
                    success: 0,
                    message: "Internal Server Error"
                })
            }

            res.status(200).json({ result })
        });
    },
    ProviderEndController: (req, res) => {
        const { provider_id, scat_id, user_id } = req.body;
        console.log(provider_id, scat_id, user_id);
        ProviderEndService(provider_id, scat_id, user_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({
                    success: 0,
                    message: "Internal Server Error"
                })
            }

            res.status(200).json({ result })
        });
    },
    ProviderOdditAllJobsController: (req, res) => {
        const { provider_id } = req.query;
        // console.log(provider_id);
        if(!provider_id){
            return res.status(400).json({ message: "Please provide provider id" })
        }
        ProviderOdditAllJobsService(provider_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({ message: "Internal Server Error" })
            }
            res.status(200).json({ result })
        });
    }

}
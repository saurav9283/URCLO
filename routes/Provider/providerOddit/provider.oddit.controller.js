const { ProviderOdditLocationService } = require("./provider.oddit.service");

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
    }
}
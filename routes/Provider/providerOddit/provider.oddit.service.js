const pool = require("../../../config/database.js");

module.exports = {
    ProviderOdditLocationService: (city, sub_cat_id, callback) => {
        const providerService = process.env.PROVIDER_SERVICE.
            replace('<sub_cat_id>', sub_cat_id);
        console.log('providerService: ', providerService);

        pool.query(providerService, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.length === 0) {
                return callback(null, { message: "No providers found" });
            }
            const providerId = result[0].providerId;
            console.log('providerId: ', providerId);
            const providerDetails = process.env.PROVIDER_DETAILS
                .replace('<id>', providerId)
                .replace('<address>', city);
            console.log('providerDetails: ', providerDetails);
            pool.query(providerDetails, [], (err, providerResult) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                const response = { ...providerResult[0] ,...result[0]};
                return callback(null, response);
            });
        });
    }
}
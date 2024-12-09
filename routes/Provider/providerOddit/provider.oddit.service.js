const pool = require("../../../config/database.js");
const moment = require('moment');
const { providerNotifyStartService, providerNotifyEndService } = require("../providerNotify/provider.notify.service.js");

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
            const providerId = result[0]?.providerId;
            console.log('providerId: ', providerId);
            const providerDetails = process.env.PROVIDER_DETAILS_ADD
                .replace('<id>', providerId)
                .replace('<address>', city);
            console.log('providerDetails: ', providerDetails);
            pool.query(providerDetails, [], (err, providerResult) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                if (providerResult.length === 0) {
                    return callback(null, { message: "No provider details found" });
                }
                else {
                    const response = { ...providerResult[0], ...result[0] };
                    return callback(null, response);
                }
            });
        });
    },
    ProviderStartingService: (provider_id, scat_id, user_id, callback) => {
        const serviceStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const serviceStartTimeString = serviceStartTime.toString();

        const providerstartworking = process.env.PROVIDER_START_WORKING
            .replace('<provider_id>', provider_id)
            .replace('<sub_cat_id>', scat_id)
            .replace('<user_id>', user_id)
            .replace('<serviceStartTime>', serviceStartTime)
        console.log('providerstartworking: ', serviceStartTimeString);

        pool.query(providerstartworking, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback(null, { message: "Wrong place in Wrong Time" });
            }
            if (result.changedRows !== 0) {
                providerNotifyStartService(provider_id, user_id);
                return callback(null, { message: "Service started" });
            }
            // else{
            // }

        });
    },
    // ProviderEndService: (provider_id, scat_id, user_id, callback) => {
    //     const serviceEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
    //     const serviceEndTimeString = serviceEndTime.toString();
    //     const providerendworking = process.env.PROVIDER_END_WORKING
    //     .replace('<provider_id>', provider_id)
    //     .replace('<sub_cat_id>', scat_id)
    //     .replace('<user_id>', user_id)
    //     .replace('<serviceEndTime>',serviceEndTimeString)
    //     .replace('<IsserviceDone>',1)
    //     console.log('providerendworking: ', providerendworking);


    //     pool.query(providerendworking, [], (err, result) => {
    //         if (err) {
    //             console.log(err);
    //             return callback(err);
    //         }
    //         if(result.affectedRows === 0) {
    //             return callback(null, { message: "Wrong place in Wrong Time" });
    //         }
    //         if(result.changedRows !== 0) {
    //             providerNotifyEndService(provider_id, user_id);
    //             return callback(null, { message: "Service ended" });
    //         }
    //         // else{
    //         // }

    //     });
    // }
    ProviderEndService: (provider_id, scat_id, user_id, callback) => {
        const serviceEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const serviceEndTimeString = serviceEndTime.toString();

        // Query to check the current status of IsserviceDone
        const checkServiceStatusQuery = process.env.CHECK_SERVICE_STATUS
            .replace('<provider_id>', provider_id)
            .replace('<sub_cat_id>', scat_id)
            .replace('<user_id>', user_id);

        console.log('checkServiceStatusQuery: ', checkServiceStatusQuery);
        pool.query(checkServiceStatusQuery, [], (err, statusResult) => {
            if (err) {
                console.log(err);
                return callback(err);
            }

            if (statusResult.length === 0) {
                return callback(null, { message: "No service found" });
            }

            if (statusResult[0].IsserviceDone === 1) {
                return callback(null, { message: "Service is already marked as done" });
            }

            // Proceed to update the service status
            const providerendworking = process.env.PROVIDER_END_WORKING
                .replace('<provider_id>', provider_id)
                .replace('<sub_cat_id>', scat_id)
                .replace('<user_id>', user_id)
                .replace('<serviceEndTime>', serviceEndTimeString)
                .replace('<IsserviceDone>', 1);

            console.log('providerendworking: ', providerendworking);

            pool.query(providerendworking, [], (err, result) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                if (result.affectedRows === 0) {
                    return callback(null, { message: "Wrong place in Wrong Time" });
                }
                if (result.changedRows !== 0) {
                    providerNotifyEndService(provider_id, user_id);
                    return callback(null, { message: "Service ended" });
                }
            });
        });
    },
    ProviderOdditAllJobsService: (provider_id, callback) => {
        const providerAllJobs = process.env.PROVIDER_ALL_JOBS
        .replace('<providerId>', provider_id);
        // console.log('providerAllJobs: ', providerAllJobs);
        pool.query(providerAllJobs, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.length === 0) {
                return callback(null, { message: "No jobs found" });
            }
            return callback(null, result);
        });
    }
    
}
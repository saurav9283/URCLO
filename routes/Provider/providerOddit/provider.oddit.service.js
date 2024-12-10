const pool = require("../../../config/database.js");
const moment = require('moment');
const { providerNotifyStartService, providerNotifyEndService } = require("../providerNotify/provider.notify.service.js");
const { sendEmail } = require("../../../services/email-service.js");

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
    },
    ProviderOdditGetDetailsService: (provider_id, callback) => {
        const providerDetails = process.env.GET_PROVIDER_DETAILS
            .replace('<providerId>', provider_id);
        console.log('providerDetails: ', providerDetails);
        pool.query(providerDetails, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },
    getProviderDetails: (providerId, callback) => {
        const query = process.env.GET_PROVIDER_DETAILS_IMages.replace('<providerId>', providerId);
        console.log('query: ', query); 
        pool.query(query, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    }, 
    ProviderOdditEditService: async (providerData, serviceData, callback) => {
        console.log('serviceData: ', serviceData);
        const providerQuery = process.env.UPDATE_PROVIDER_DETAILS
        .replace('<providerId>', providerData.providerId)
        .replace('<name>', providerData.name)
        .replace('<email>', providerData.email)
        .replace('<age>', providerData.age)
        .replace('<DOB>', providerData.DOB)
        .replace('<phone>', providerData.phone)
        .replace('<address>', providerData.address)
        .replace('<documentNumber>', providerData.documentNumber)
        .replace('<documentType>', providerData.documentType);
        console.log('providerQuery: ', providerQuery);
        pool.query(providerQuery, (err, result) => {
            if (err) {
                console.error("Error updating provider data:", err.message);
                return callback(err);
            }

            const serviceQuery = process.env.UPDATE_PROVIDER_SERVICE_DETAILS
            .replace('<providerId>', providerData.providerId)
            .replace('<masterId>', serviceData.masterId)
            .replace('<cat_id>', serviceData.cat_id)
            .replace('<sub_cat_id>', serviceData.sub_cat_id)
            .replace('<availableTime>', serviceData.availableTime)
            .replace('<price>', serviceData.price)
            .replace('<images_details>', JSON.stringify(serviceData.images))
            .replace('<description>', serviceData.description)
            .replace('<providerImage>', serviceData.providerImage);
            console.log('serviceQuery: ', serviceQuery);
             
            pool.query(serviceQuery,async (err, result) => {
                if (err) {
                    console.error("Error updating service data:", err.message);
                    return callback(err);
                } 
                // console.log('result: ', result);
                if(result.affectedRows > 0)
                {
                    const emailPayload = {
                        from: process.env.MAIL_SENDER_EMAIL,
                        to: providerData.email,
                        subject: 'Profile Updated Successfully',
                        template: 'providerDetailUpdate.ejs',
                        data: { name: providerData.name },
                    };
                    await sendEmail(emailPayload);
                }
                callback(null, "Data updated successfully.");
            });
        });
    },
    ProviderOdditGetFiggureService: (provider_id, callback) => {
        const providerFiguresQuery = process.env.PROVIDER_FIGURES_QUERY;

        pool.query(providerFiguresQuery, [provider_id, provider_id, provider_id, provider_id], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }

            const figures = {
                totalBookings: result[0].totalBookings,
                completedBookings: result[0].completedBookings,
                pendingBookings: result[0].pendingBookings,
                totalEarnings: result[0].totalEarnings
            };

            return callback(null, figures);
        });
    },
    ProviderOdditApprovalService: (provider_id, user_id,AcceptanceStatus,sub_cat_id, callback) => {
        const providerApprovalQuery = process.env.PROVIDER_APPROVAL_QUERY
            .replace('<provider_id>', provider_id)
            .replace('<user_id>', user_id)
            .replace('<AcceptanceStatus>', AcceptanceStatus)
            .replace('<sub_cat_id>',sub_cat_id)
        console.log('providerApprovalQuery: ', providerApprovalQuery);
        pool.query(providerApprovalQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback(null, { message: "No jobs found" });
            }

            // Fetch user email and name for sending email
            const getUserDetailsQuery = process.env.getUserDetailsQuery
            .replace('<user_id>', user_id);
            pool.query(getUserDetailsQuery, async(err, userResult) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                if (userResult.length === 0) {
                    return callback(null, { message: "User not found" });
                }

                const userEmail = userResult[0].email;
                console.log('userEmail: ', userEmail);
                const userName = userResult[0].name;
                console.log('userName: ', userName);

                console.log('AcceptanceStatus: ', AcceptanceStatus); 
                if (AcceptanceStatus ===  1) {
                    console.log(" inside if"); 
                    // Send email for payment
                    const emailPayload = {
                        from: process.env.MAIL_SENDER_EMAIL,
                        to: userEmail,
                        subject: 'Order Accepted - Payment Required',
                        template: 'orderAccepted.ejs',
                        data: { userName: userName },
                    }; 
                    console.log('emailPayload: ', emailPayload);
                   await sendEmail(emailPayload);
                    return callback(null, { message: "Job approved and email sent for payment" });
                } else if (AcceptanceStatus === 2) { 
                    // Send email for cancellation
                    const emailPayload = {
                        from: process.env.MAIL_SENDER_EMAIL,
                        to: userEmail,
                        subject: 'Order Cancelled',
                        template: 'orderCancelled.ejs',
                        data: { userName: userName },
                    }; 
                    await sendEmail(emailPayload);
                    return callback(null, { message: "Job cancelled and email sent to user" });
                } else {
                    return callback(null, { message: "Job status updated" });
                }
            });
        });
    }
}
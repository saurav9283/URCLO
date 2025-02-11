const pool = require("../../../config/database.js");
const moment = require('moment');
const { providerNotifyStartService, providerNotifyEndService } = require("../providerNotify/provider.notify.service.js");
const { sendEmail } = require("../../../services/email-service.js");
const jwt = require('jsonwebtoken');
const { notificationService, updateOnOrderNotificationService } = require("../../User/userNotification/user.notification.service.js");
const extendAvailableTime = require("../../../lib/extendAvailableTime.js");

module.exports = {
    // ProviderOdditLocationService: (city, sub_cat_id, callback) => {
    //     const providerService = process.env.PROVIDER_SERVICE
    //         .replace('<sub_cat_id>', sub_cat_id);
    //     console.log('providerService: ', providerService);

    //     pool.query(providerService, [], (err, result) => {
    //         if (err) {
    //             console.log(err);
    //             return callback(err);
    //         }
    //         if (result.length === 0) {
    //             return callback(null, { message: "No providers found" });
    //         }
    //         const providerId = result[0]?.providerId;
    //         console.log('providerId: ', providerId);
    //         const providerDetails = process.env.PROVIDER_DETAILS_ADD
    //             .replace('<id>', providerId)
    //             .replace('<address>', city)
    //             .replace('<sub_cat_id>', sub_cat_id);
    //         console.log('providerDetails: ', providerDetails);
    //         pool.query(providerDetails, [], (err, providerResult) => {
    //             if (err) {
    //                 console.log(err);
    //                 return callback(err);
    //             }
    //             if (providerResult.length === 0) {
    //                 return callback(null, { message: "No provider details found" });
    //             }
    //             else {
    //                 console.log('providerResult: ', providerResult);
    //                 const response = { ...providerResult[0], ...result[0] };
    //                 return callback(null, response);
    //             }
    //         });
    //     });
    // },

    ProviderOdditLocationService: (city, sub_cat_id, callback) => {
        const providerService = process.env.PROVIDER_SERVICE
            .replace('<sub_cat_id>', sub_cat_id);
        console.log('providerService: ', providerService);

        pool.query(providerService, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.length === 0) {
                return callback(null, { message: "No providers found" });
            }

            const providerDetailsPromises = result?.map(provider => {
                const providerId = provider.providerId;
                console.log('providerId: ', providerId);
                const providerDetails = process.env.PROVIDER_DETAILS_ADD
                    .replace('<id>', providerId)
                    .replace('<address>', city)
                    .replace('<sub_cat_id>', sub_cat_id);
                console.log('providerDetails: ', providerDetails);

                return new Promise((resolve, reject) => {
                    pool.query(providerDetails, [], (err, providerResult) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        if (providerResult.length === 0) {
                            return resolve(null);
                        } else {
                            console.log('providerResult: ', providerResult);
                            const response = { ...providerResult[0], ...provider };
                            return resolve(response);
                        }
                    });
                });
            });

            Promise.all(providerDetailsPromises)
                .then(responses => {
                    const filteredResponses = responses.filter(response => response !== null);
                    if (filteredResponses.length === 0) {
                        return callback(null, { message: "No provider details found" });
                    }
                    return callback(null, filteredResponses);
                })
                .catch(error => {
                    console.log(error);
                    return callback(error);
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

        });
    },

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
        // console.log('providerDetails: ', providerDetails);
        pool.query(providerDetails, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderOdditGetServiceDetailsService: (masterId, cat_id, sub_cat_id, callback) => {
        console.log('masterId, cat_id, sub_cat_id: ', masterId, cat_id, sub_cat_id);
        let subCatIds;
        try {
            subCatIds = typeof sub_cat_id === 'string' ? JSON.parse(sub_cat_id) : sub_cat_id;
        } catch (error) {
            return callback(new Error("sub_cat_id must be a valid JSON array"));
        }

        // Validate that subCatIds is an array
        if (!Array.isArray(subCatIds) || subCatIds.length === 0) {
            return callback(new Error("sub_cat_id must be a non-empty array"));
        }
        const subCatIdList = subCatIds.join(',');
        console.log('subCatIdList: ', subCatIdList);

        const providerServiceDetails = process.env.GET_PROVIDER_SERVICE_DETAILS
            .replace('<masterId>', masterId)
            .replace('<cat_id>', cat_id)
            .replace('<sub_cat_id>', subCatIdList);
        console.log('providerServiceDetails: ', providerServiceDetails);

        pool.query(providerServiceDetails, [], (err, serviceResult) => {
            if (err) {
                console.log(err);
                return callback(err);
            }

            if (serviceResult.length === 0) {
                return callback(null, { message: "No service details found" });
            }

            const getMasterCategoryNameQuery = `SELECT masterName FROM mastercategory WHERE masterId = ?`;
            const getCategoryNameQuery = `SELECT cat_name FROM tbl_cat WHERE cat_id = ?`;
            const getSubCategoryNameQuery = `SELECT sub_cat_name FROM tbl_sub_cat WHERE sub_cat_id in (?)`;

            pool.query(getMasterCategoryNameQuery, [masterId], (err, masterCategoryResult) => {
                console.log('masterCategoryResult: ', masterCategoryResult);
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                if (masterCategoryResult.length === 0) {
                    return callback(null, { message: "Master category not found" });
                }

                const masterCategoryName = masterCategoryResult[0].masterName;

                pool.query(getCategoryNameQuery, [cat_id], (err, categoryResult) => {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    if (categoryResult.length === 0) {
                        return callback(null, { message: "Category not found" });
                    }

                    const categoryName = categoryResult[0].cat_name;

                    pool.query(getSubCategoryNameQuery, [subCatIdList], (err, subCategoryResult) => {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }

                        if (subCategoryResult.length === 0) {
                            return callback(null, { message: "Sub-category not found" });
                        }

                        const subCategoryName = subCategoryResult[0].sub_cat_name;

                        const response = {
                            // serviceDetails: serviceResult, 
                            masterCategoryName,
                            categoryName,
                            subCategoryName
                        };

                        return callback(null, response);
                    });
                });
            });
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

    // ProviderOdditEditService: async (providerData, serviceData, callback) => {
    //     console.log('serviceData: ', serviceData.availableTime);
    //     console.log('serviceData: ', serviceData.newAvailableTime);

    //     const providerQuery = process.env.UPDATE_PROVIDER_DETAILS
    //         .replace('<providerId>', providerData.providerId)
    //         .replace('<name>', providerData.name)
    //         .replace('<email>', providerData.email)
    //         .replace('<age>', providerData.age)
    //         .replace('<DOB>', providerData.DOB)
    //         .replace('<phone>', providerData.phone)
    //         .replace('<address>', providerData.address)
    //         .replace('<documentNumber>', providerData.documentNumber)
    //         .replace('<documentType>', providerData.documentType);
    //     console.log('providerQuery: ', providerQuery);
    //     pool.query(providerQuery, (err, result) => {
    //         if (err) {
    //             console.error("Error updating provider data:", err.message);
    //             return callback(err);
    //         }

    //         const updatedAvailableTime = extendAvailableTime(serviceData.availableTime, serviceData.newAvailableTime);
    //         console.log('updatedAvailableTime: ', JSON.stringify(updatedAvailableTime));
    //         const newABLTime = JSON.stringify(updatedAvailableTime);

    //         const serviceQuery = process.env.UPDATE_PROVIDER_SERVICE_DETAILS
    //             .replace('<providerId>', providerData.providerId)
    //             .replace('<availableTime>', newABLTime)
    //             .replace('<price>', serviceData.price)
    //             .replace('<images_details>', JSON.stringify(serviceData.images))
    //             .replace('<description>', serviceData.description)
    //             .replace('<providerImage>', serviceData.providerImage);
    //         console.log('serviceQuery: ', serviceQuery);

    //         pool.query(serviceQuery, async (err, result) => {
    //             if (err) {
    //                 console.error("Error updating service data:", err.message);
    //                 return callback(err);
    //             }

    //             let subCatIds;
    //             try {
    //                 subCatIds = JSON.parse(serviceData.sub_cat_id);
    //                 subCatIds = subCatIds.map(id => parseInt(id, 10));
    //             } catch (error) {
    //                 console.error("Error parsing sub_cat_id:", error.message);
    //                 return callback(error);
    //             }

    //             const existingSubCatQuery = `
    //                 SELECT sub_cat_id FROM tbl_provider_category
    //                 WHERE providerId = ? AND sub_cat_id IN (?)
    //             `;
    //             pool.query(existingSubCatQuery, [providerData.providerId, subCatIds], (err, existingSubCats) => {
    //                 if (err) {
    //                     console.error("Error fetching existing sub categories:", err.message);
    //                     return callback(err);
    //                 }

    //                 const existingSubCatIds = existingSubCats.map(row => row.sub_cat_id);
    //                 const newSubCatIds = subCatIds.filter(id => !existingSubCatIds.includes(id));

    //                 if (newSubCatIds.length > 0) {
    //                     const insertSubCatQuery = `
    //                         INSERT INTO tbl_provider_category (providerId, masterId, cat_id, sub_cat_id)
    //                         VALUES ?
    //                     `;
    //                     const insertValues = newSubCatIds.map(subCatId => [
    //                         providerData.providerId,
    //                         serviceData.masterId,
    //                         serviceData.cat_id,
    //                         subCatId
    //                     ]);

    //                     pool.query(insertSubCatQuery, [insertValues], (err, result) => {
    //                         if (err) {
    //                             console.error("Error inserting new sub categories:", err.message);
    //                             return callback(err);
    //                         }
    //                         finalizeUpdate();
    //                     });
    //                 } else {
    //                     finalizeUpdate();
    //                 }
    //             });

    //             async function finalizeUpdate() {
    //                 if (result.affectedRows > 0) {
    //                     const emailPayload = {
    //                         from: process.env.MAIL_SENDER_EMAIL,
    //                         to: providerData.email,
    //                         subject: 'Profile Updated Successfully',
    //                         template: 'providerDetailUpdate.ejs',
    //                         data: { name: providerData.name },
    //                     };
    //                     await sendEmail(emailPayload);
    //                 }
    //                 callback(null, "Data updated successfully.");
    //             }
    //         });
    //     });
    //     // });
    // },


    ProviderOdditEditService: async (providerData, serviceData, callback) => {
        console.log('serviceData: ', serviceData.availableTime);
        console.log('serviceData: ', serviceData.newAvailableTime);

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

            const updatedAvailableTime = extendAvailableTime(serviceData.availableTime, serviceData.newAvailableTime);
            console.log('updatedAvailableTime: ', JSON.stringify(updatedAvailableTime));
            const newABLTime = JSON.stringify(updatedAvailableTime);
            console.log('newABLTime: ', newABLTime);

            const serviceQuery = process.env.UPDATE_PROVIDER_SERVICE_DETAILS
                .replace('<providerId>', providerData.providerId)
                .replace('<availableTime>', newABLTime)
                .replace('<price>', serviceData.price)
            // .replace('<images_details>', JSON.stringify(serviceData.images))
            // .replace('<description>', serviceData.description)
            // .replace('<providerImage>', serviceData.providerImage);
            console.log('serviceQuery: ', serviceQuery);

            pool.query(serviceQuery, async (err, result) => {
                if (err) {
                    console.error("Error updating service data:", err.message);
                    return callback(err);
                }
                return callback(null, { message: "Data updated successfully" });
            });
        });
    },

    ProviderOdditEditImagesService: async (serviceData, callback) => {
        const serviceQuery = process.env.UPDATE_PROVIDER_SERVICE_Images
            .replace('<providerId>', serviceData.providerId)
            .replace('<images_details>', JSON.stringify(serviceData.images))
            .replace('<description>', serviceData.description)
            .replace('<providerImage>', serviceData.providerImage);
        console.log('serviceQuery: ', serviceQuery);

        pool.query(serviceQuery, async (err, result) => {
            if (err) {
                console.error("Error updating service data:", err.message);
                return callback(err);
            }
            return callback(null, { message: "Data updated successfully" });
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

    ProviderOdditApprovalService: (Booking_id, provider_id, user_id, AcceptanceStatus, sub_cat_id, sub_providerId, sub_providerName, sub_providerNumber, price, callback) => {
        const providerApprovalQuery = process.env.PROVIDER_APPROVAL_QUERY
            .replace('<Booking_id>', Booking_id)
            .replace('<provider_id>', provider_id)
            .replace('<user_id>', user_id)
            .replace('<AcceptanceStatus>', AcceptanceStatus)
            .replace('<sub_cat_id>', sub_cat_id)
            .replace('<sub_providerId>', sub_providerId);
        console.log('providerApprovalQuery: ', providerApprovalQuery);

        pool.query(providerApprovalQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            console.log('result: ', result);
            if (result.affectedRows === 0) {
                return callback(null, { message: "No jobs found" });
            }

            // Fetch user email and name for sending email
            const getUserDetailsQuery = process.env.getUserDetailsQuery
                .replace('<user_id>', user_id);
            pool.query(getUserDetailsQuery, async (err, userResult) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                if (userResult.length === 0) {
                    return callback(null, { message: "User not found" });
                }

                const userEmail = userResult[0].email;
                const userName = userResult[0].name;

                // Fetch provider name
                const getProviderNameQuery = process.env.GET_PROVIDER_NAME_QUERY
                    .replace('<provider_id>', provider_id);
                pool.query(getProviderNameQuery, async (err, providerResult) => {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }
                    if (providerResult.length === 0) {
                        return callback(null, { message: "Provider not found" });
                    }

                    const providerName = providerResult[0].name;

                    // Check if service is done and payment status
                    const checkServiceQuery = process.env.checkServiceQuery;
                    pool.query(checkServiceQuery, [user_id, provider_id, sub_cat_id], async (err, serviceResult) => {
                        console.log('serviceResult: ', serviceResult);
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        if (serviceResult.length === 0) {
                            return callback(null, { message: "No service found" });
                        }
                        if (serviceResult[0].IsserviceDone === 1) {
                            return callback(null, { message: "Service is already done" });
                        }
                        if (serviceResult[0].Payment_Status === 1) {
                            return callback(null, { message: "Payment is already made" });
                        }

                        const amount = serviceResult[0].quantity * price;

                        if (AcceptanceStatus === 1) {
                            // Send email for payment
                            const token = jwt.sign({ user_id, provider_id, sub_cat_id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
                            const paymentLink = `${process.env.PAYMENT_URL}?token=${token}`;

                            const emailPayload = {
                                from: process.env.MAIL_SENDER_EMAIL,
                                to: userEmail,
                                subject: 'Order Accepted - Payment Required',
                                template: 'orderAccepted.ejs',
                                data: { userName, paymentLink, amount, providerName, sub_providerName, sub_providerNumber },
                            };
                            try {
                                await sendEmail(emailPayload);
                                // console.log('user_id, providerName: ', user_id, providerName);
                                await updateOnOrderNotificationService(user_id, providerName);
                            } catch (error) {
                                console.error('Error sending email:', error);
                            }
                            return callback(null, { status: true, message: "Job approved and email sent for payment" });
                        } else if (AcceptanceStatus === 2) {
                            // Send email for cancellation
                            const emailPayload = {
                                from: process.env.MAIL_SENDER_EMAIL,
                                to: userEmail,
                                subject: 'Order Cancelled',
                                template: 'orderCancelled.ejs',
                                data: { userName, providerName },
                            };
                            await sendEmail(emailPayload);

                            return callback(null, { status: false, message: "Job cancelled and email sent to user" });
                        } else {
                            return callback(null, { message: "Job status updated" });
                        }
                    });
                });
            });
        });
    },

    ProviderOdditPaymentStatusService: (user_id, provider_id, sub_cat_id, callback) => {
        const checkServiceStatusQuery = process.env.CHECK_SERVICE_STATUS
            .replace('<provider_id>', provider_id)
            .replace('<sub_cat_id>', sub_cat_id)
            .replace('<user_id>', user_id);

        pool.query(checkServiceStatusQuery, (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.length === 0) {
                return callback(null, { message: "No jobs found" });
            }

            const { IsserviceDone, AcceptanceStatus, Payment_Status } = result[0];
            console.log('result[0]: ', result[0]);
            if (IsserviceDone === 0) {
                return callback(null, { message: "Service is not done" });
            }
            if (AcceptanceStatus === 0) {
                return callback(null, { message: "Job is not accepted" });
            }
            if (Payment_Status === 1) {
                return callback(null, { message: "Payment is already done" });
            }

            const updatePaymentStatusQuery = process.env.UPDATE_PAYMENT_STATUS_QUERY
                .replace('<user_id>', user_id)
                .replace('<provider_id>', provider_id)
                .replace('<sub_cat_id>', sub_cat_id);
            console.log('updatePaymentStatusQuery: ', updatePaymentStatusQuery);

            pool.query(updatePaymentStatusQuery, [], async (err, updateResult) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                if (updateResult.affectedRows === 0) {
                    return callback(null, { message: "No jobs found" });
                }

                // Fetch user email from tbl_user
                const getUserEmailQuery = process.env.GET_USER_EMAIL_QUERY
                    .replace('<user_id>', user_id);
                console.log('getUserEmailQuery: ', getUserEmailQuery);
                pool.query(getUserEmailQuery, async (err, userResult) => {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }
                    if (userResult.length === 0) {
                        return callback(null, { message: "User not found" });
                    }

                    const userEmail = userResult[0].email;

                    const payload_payment_Done = {
                        from: process.env.MAIL_SENDER_EMAIL,
                        to: userEmail,
                        subject: 'Payment Done',
                        template: 'paymentDone.ejs',
                        data: { name: 'Dear Customer' },
                    };
                    await sendEmail(payload_payment_Done);

                    return callback(null, { message: "Payment status updated successfully" });
                });
            });
        });
    },

    getProviderByIDService: (providerId, callback) => {
        // GET_PROVIDER_DETAILS_BY_ID
        const query = process.env.GET_PROVIDER_DETAILS.replace('<providerId>', providerId);
        console.log('query: ', query);
        pool.query(query, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderOdditGetServiceDetailsEditService: (provider_id, callback) => {
        try {
            const query = process.env.GET_PROVIDER_SERVICE_DETAILS_EDIT
                .replace('<providerId>', provider_id);
            console.log('query: ', query);
            pool.query(query, [], (err, result) => {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                return callback(null, result);
            });
        } catch (error) {

        }
    },

    ProviderServiceSubCatListService: (cat_id, callback) => {
        const query = process.env.GET_SUB_CAT_LIST
            .replace('<cat_id>', cat_id);
        console.log('query: ', query);
        pool.query(query, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderAddSubCatService: (providerId, cat_id, sub_cat_id, callback) => {
        const getmasterId = process.env.PROVIDER_GET_MASTER_ID.replace('<providerId>', providerId);
        console.log('getmasterId: ', getmasterId);

        pool.query(getmasterId, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.length === 0) {
                return callback(null, { message: "No masterId found" });
            }
            const masterId = result[0].masterId;
            console.log('masterId: ', masterId);
            console.log("type of sub_cat_id", typeof sub_cat_id);
            const subCatIds = Array.isArray(sub_cat_id) ? sub_cat_id : [sub_cat_id];
            console.log('subCatIds: ', subCatIds);

            const insertPromises = subCatIds.map(subCat => {
                return new Promise((resolve, reject) => {
                    const checkQuery = process.env.CHECK_SUB_CAT_EXISTS
                        .replace('<providerId>', providerId)
                        .replace('<masterId>', masterId)
                        .replace('<cat_id>', cat_id)
                        .replace('<sub_cat_id>', subCat);
                    console.log('checkQuery: ', checkQuery);
                    pool.query(checkQuery, [providerId, masterId, cat_id, subCat], (err, result) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        if (result.length > 0) {
                            return resolve({ message: "Sub-category already exists" });
                        }

                        const providerAddSubCat = process.env.PROVIDER_ADD_SUB_CAT
                            .replace('<providerId>', providerId)
                            .replace('<masterId>', masterId)
                            .replace('<cat_id>', cat_id)
                            .replace('<sub_cat_id>', subCat);

                        console.log('providerAddSubCat: ', providerAddSubCat);

                        pool.query(providerAddSubCat, [], (err, result) => {
                            if (err) {
                                console.log(err);
                                return reject(err);
                            }
                            if (result.affectedRows === 0) {
                                return reject(new Error("No jobs found for subcategory"));
                            }
                            resolve(result);
                        });
                    });
                });
            });

            Promise.all(insertPromises)
                .then(results => {
                    callback(null, "Subcategories added successfully");
                })
                .catch(error => {
                    console.error('Error:', error);
                    callback(error);
                });
        });
    },

    ProviderDeleteSubCatService: (providerId, cat_id, sub_cat_id, callback) => {
        const deleteQuery = process.env.DELETE_SUB_CAT
            .replace('<providerId>', providerId)
            .replace('<cat_id>', cat_id)
            .replace('<sub_cat_id>', sub_cat_id);
        console.log('deleteQuery: ', deleteQuery);
        pool.query(deleteQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback(null, { message: "No jobs found" });
            }
            return callback(null, "Subcategory deleted successfully");
        });
    },

    ProviderGetAddCategoryService: (providerId, callback) => {
        const query = process.env.GET_ADD_CATEGORY
            .replace(/<provider_id>/g, providerId);
        console.log('query: ', query);
        pool.query(query, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderDeleteCategoryService: (providerId, cat_id, masterId, callback) => {
        const deleteQuery = process.env.DELETE_CATEGORY
            .replace('<providerId>', providerId)
            .replace('<cat_id>', cat_id)
            .replace('<masterId>', masterId);
        console.log('deleteQuery: ', deleteQuery);
        pool.query(deleteQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback(null, { message: "No jobs found" });
            }
            return callback(null, "Category deleted successfully");
        });
    },

    ProviderMaterListService: (providerId, callback) => {
        console.log('providerId: ', providerId);
        const getMasterList = process.env.GET_MASTER_LIST
            .replace('<providerId>', providerId);
        console.log('getMasterList: ', getMasterList);
        pool.query(getMasterList, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderCategoryListService: (providerId, masterId, callback) => {
        const getCategory = process.env.GET_CATEGORY
            .replace('<providerId>', providerId)
            .replace('<masterId>', masterId);
        console.log('getCategory: ', getCategory);
        pool.query(getCategory, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });

    },

    ProviderSubCategoryListService: (providerId, master_id, cat_id, callback) => {
        const getSubCategory = process.env.GET_SUB_CATEGORY
            .replace('<providerId>', providerId)
            .replace('<masterId>', master_id)
            .replace('<cat_id>', cat_id);
        console.log('getSubCategory: ', getSubCategory);
        pool.query(getSubCategory, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderOdditGetSubProviderService: (providerId, masterId, cat_id, sub_cat_id, callback) => {
        console.log('providerId, masterId, cat_id, sub_cat_id: ', providerId, masterId, cat_id, sub_cat_id);
        const getSubProviderQuery = process.env.GET_SUB_PROVIDER_EMPLOYE
            .replace('<providerId>', providerId)
            .replace('<masterId>', masterId)
            .replace('<cat_id>', cat_id)
            .replace('<sub_cat_id>', sub_cat_id);
        console.log('getSubProviderQuery: ', getSubProviderQuery);
        pool.query(getSubProviderQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    ProviderOdditGetAllTransactionsService: (providerId, callback) => {
        const getTransactionsQuery = process.env.GET_ALL_TRANSACTIONS
            .replace('<providerId>', providerId);
        console.log('getTransactionsQuery: ', getTransactionsQuery);
        pool.query(getTransactionsQuery, [], (err, result) => {
            if (err) {
                console.log(err);
                return callback(err);
            }
            return callback(null, result);
        });
    }

}
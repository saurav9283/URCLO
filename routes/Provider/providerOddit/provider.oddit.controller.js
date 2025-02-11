const { ProviderOdditLocationService, ProviderStartingService, ProviderEndService, ProviderOdditAllJobsService, ProviderOdditGetDetailsService, ProviderOdditEditService, getProviderDetails, ProviderOdditGetFiggureService, ProviderOdditApprovalService, ProviderOdditPaymentStatusService, ProviderOdditGetServiceDetailsService, getProviderByIDService, ProviderOdditGetServiceDetailsEditService, ProviderServiceSubCatListService, ProviderAddSubCatService, ProviderDeleteSubCatService, ProviderGetAddCategoryService, ProviderDeleteCategoryService, ProviderMaterListService, ProviderCategoryListService, ProviderSubCategoryListService, ProviderOdditGetSubProviderService, ProviderOdditEditImagesService, ProviderOdditGetAllTransactionsService } = require("./provider.oddit.service");
const path = require('path');
const jwt = require('jsonwebtoken');
const { type } = require("os");

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
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide provider id" })
        }
        ProviderOdditAllJobsService(provider_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({ message: "Internal Server Error" })
            }
            if (result.length === 0) {
                return res.status(400).json({ message: "No upcoming jobs or jobs in progress" })
            }
            else {
                res.status(200).json({ result })

            }
        });
    },
    ProviderOdditDetailsController: (req, res) => {
        const { provider_id } = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "provider id is missing:)" })
        }
        ProviderOdditGetDetailsService(provider_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({ message: "Internal Server Error" })
            }
            if (result.length === 0) {
                return res.status(400).json({ message: "No Provider Detail fount" })
            }
            else {
                res.status(200).json({ result })
            }
        });
    },
    ProviderOdditServiceDetailsController: (req, res) => {
        const { masterId, cat_id, sub_cat_id } = req.body;
        console.log(masterId, cat_id, sub_cat_id);
        if (!masterId || !cat_id || !sub_cat_id) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderOdditGetServiceDetailsService(masterId, cat_id, sub_cat_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    // ProviderOdditEditController: async (req, res) => {
    //     try {
    //         const {
    //             name, email, age, DOB, masterId, cat_id, sub_cat_id,
    //             phone, address, availableTime, documentNumber, documentType,
    //             price, description, providerId, newAvailableTime
    //         } = req.body;
    //         console.log('req.body: ', req.body);

    //         if (!name || !email || !age || !DOB || !masterId || !cat_id || !sub_cat_id || !phone || !address || !availableTime || !newAvailableTime || !documentNumber || !documentType || !price || !description || !providerId) {
    //             return res.status(400).json({ message: "Please provide all the details" });
    //         }

    //         if (age < 18 || age > 60) {
    //             return res.status(400).json({ message: "You are not legally allowed to work with us." });
    //         }

    //         // Fetch existing provider and service data
    //         const existingData = await new Promise((resolve, reject) => {
    //             getProviderDetails(providerId, (err, result) => {
    //                 if (err) reject(err);
    //                 resolve(result[0]);
    //             });
    //         });

    //         const providerImage = req.files?.providerImage?.[0]?.path;
    //         console.log('providerImage: ', providerImage);
    //         const image1 = req.files?.images1?.[0]?.path;
    //         const image2 = req.files?.images2?.[0]?.path;
    //         const image3 = req.files?.images3?.[0]?.path;
    //         const images = existingData.images_details ? JSON.parse(existingData?.images_details) : [];

    //         if (image1) {
    //             images[0] = `${req.protocol}://${req.get('host')}/images/${path.basename(image1)}`;
    //         }
    //         if (image2) {
    //             images[1] = `${req.protocol}://${req.get('host')}/images/${path.basename(image2)}`;
    //         }
    //         if (image3) {
    //             images[2] = `${req.protocol}://${req.get('host')}/images/${path.basename(image3)}`;
    //         }
    //         const providerImageUrl = providerImage ? `${req.protocol}://${req.get('host')}/images/${path.basename(providerImage)}` : existingData?.providerImage;

    //         const updatedData = {
    //             name,
    //             email,
    //             age,
    //             DOB,
    //             phone,
    //             address,
    //             documentNumber,
    //             documentType,
    //             providerImage: providerImageUrl,
    //             providerId,
    //         };

    //         const serviceData = {
    //             masterId,
    //             cat_id,
    //             sub_cat_id,
    //             availableTime,
    //             newAvailableTime,
    //             price,
    //             description,
    //             images,
    //             providerImage: providerImageUrl,
    //             description,
    //         };

    //         ProviderOdditEditService(updatedData, serviceData, (err, result) => {
    //             if (err) {
    //                 return res.status(500).json({ message: "Internal Server Error" });
    //             }
    //             return res.status(200).json({ message: result });
    //         });
    //     } catch (error) {
    //         console.error('Error:', error.message);
    //         res.status(400).json({ error: error.message });
    //     }
    // },


    ProviderOdditEditController: async (req, res) => {
        console.log(req.body)
        try {
            const {
                name, email, age, DOB,
                phone, address, availableTime, documentNumber, documentType,
                price, providerId, newAvailableTime
            } = req.body;
            console.log('req.body: ', req.body);

            if (!name || !email || !age || !DOB || !phone || !address || !availableTime || !newAvailableTime || !documentNumber || !documentType || !price || !providerId) {
                return res.status(400).json({ message: "Please provide all the details" });
            }

            if (age < 18 || age > 60) {
                return res.status(400).json({ message: "You are not legally allowed to work with us." });
            }

            // Fetch existing provider and service data
            const existingData = await new Promise((resolve, reject) => {
                getProviderDetails(providerId, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                });
            });

            // const providerImage = req.files?.providerImage?.[0]?.path;
            // console.log('providerImage: ', providerImage);
            // const image1 = req.files?.images1?.[0]?.path;
            // const image2 = req.files?.images2?.[0]?.path;
            // const image3 = req.files?.images3?.[0]?.path;
            // const images = existingData.images_details ? JSON.parse(existingData?.images_details) : [];

            // if (image1) {
            //     images[0] = `${req.protocol}://${req.get('host')}/images/${path.basename(image1)}`;
            // }
            // if (image2) {
            //     images[1] = `${req.protocol}://${req.get('host')}/images/${path.basename(image2)}`;
            // }
            // if (image3) {
            //     images[2] = `${req.protocol}://${req.get('host')}/images/${path.basename(image3)}`;
            // }
            // const providerImageUrl = providerImage ? `${req.protocol}://${req.get('host')}/images/${path.basename(providerImage)}` : existingData?.providerImage;

            const updatedData = {
                name,
                email,
                age,
                DOB,
                phone,
                address,
                documentNumber,
                documentType,
                // providerImage: providerImageUrl,
                providerId,
            };

            const serviceData = {
                availableTime,
                newAvailableTime,
                price,
                // providerImage: providerImageUrl,
                // description,
            };

            ProviderOdditEditService(updatedData, serviceData, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: result });
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderOdditEditImagesController: async (req, res) => {
        try {
            const { providerId, description } = req.body;
            console.log('description: ', typeof description);
            console.log('req.body: ', req.body);
            if (!providerId) {
                return res.status(400).json({ message: "Please provide provider id" });
            }
            const existingData = await new Promise((resolve, reject) => {
                getProviderDetails(providerId, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                });
            });
            console.log('existingData: ', existingData);
            const providerImage = req.files?.providerImage?.[0]?.path;
            console.log('providerImage: ', providerImage);
            const image1 = req.files?.images1?.[0]?.path;
            console.log('image1: ', image1);
            const image2 = req.files?.images2?.[0]?.path;
            console.log('image2: ', image2);
            const image3 = req.files?.images3?.[0]?.path;
            console.log('image3: ', image3);
            let images = existingData.images_details ? JSON.parse(existingData?.images_details) : [];
            let descriptions = existingData.description ? JSON.parse(existingData?.description) : [];
            console.log('images: ', images);
            console.log('descriptions: ', descriptions);
            console.log('descriptions: ', typeof descriptions);

            if (image1) {
                images[0] = `${req.protocol}://${req.get('host')}/images/${path.basename(image1)}`;
                descriptions[0] = description[0];
            }
            else if (images[0]) {
                delete images[0];
                delete descriptions[0];
            }

            if (image2) {
                images[1] = `${req.protocol}://${req.get('host')}/images/${path.basename(image2)}`;
                descriptions[1] = description[1];
            }
            else if (images[1]) {
                // console.log('delete 1st image', images[1]);
                delete images[1];
                delete descriptions[1];
            }

            if (image3) {
                images[2] = `${req.protocol}://${req.get('host')}/images/${path.basename(image3)}`;
                descriptions[2] = description[2];
            }
            else if (images[2]) {
                // console.log('delete 2st image', images[2]);
                delete images[2];
                delete descriptions[2];
            }
            console.log('descriptions:-=-= ', descriptions);

            const providerImageUrl = providerImage ? `${req.protocol}://${req.get('host')}/images/${path.basename(providerImage)}` : existingData?.providerImage;
            console.log('providerImageUrl: ', providerImageUrl);

            images = images.filter(image => image !== undefined);
            console.log('images: ', images);
            descriptions = descriptions.filter(description => description !== undefined);

            const serviceData = {
                providerId,
                providerImage: providerImageUrl,
                descriptions,
                images,
            };

            ProviderOdditEditImagesService(serviceData, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: result });
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderOdditFiggureController: (req, res) => {
        const { provider_id } = req.query;
        // console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide provider id" })
        }
        ProviderOdditGetFiggureService(provider_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({ message: "Internal Server Error" })
            }
            res.status(200).json({ result })
        });
    },
    ProviderOdditApprovalController: (req, res) => {
        const { Booking_id, provider_id, user_id, AcceptanceStatus, sub_cat_id, sub_providerId, sub_providerName, sub_providerNumber, price } = req.body;
        console.log(provider_id, user_id, AcceptanceStatus, Booking_id);
        if (!provider_id || !user_id || !AcceptanceStatus || !sub_cat_id || !sub_providerId || !sub_providerName || !sub_providerNumber || !price) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderOdditApprovalService(Booking_id, provider_id, user_id, AcceptanceStatus, sub_cat_id, sub_providerId, sub_providerName, sub_providerNumber, price, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }

                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });

        }
    },
    ProviderOdditPaymentStatusController: (req, res) => {
        // const { user_id, provider_id, sub_cat_id } = req.body;
        const token = req.query.token
        console.log('token: ', token);
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const { user_id, provider_id, sub_cat_id } = decoded;
            console.log('Decoded token: ', decoded);
            ProviderOdditPaymentStatusService(user_id, provider_id, sub_cat_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }

                return res.status(200).json({ message: "Payment status updated successfully", result });
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },
    ProviderOdditByIDController: (req, res) => {
        const { provider_id } = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "provider id is missing:)" })
        }
        getProviderByIDService(provider_id, (err, result) => {
            if (err) {
                console.log('err: ', err);
                res.status(500).json({ message: "Internal Server Error" })
            }
            res.status(200).json({ result })
        });
    },

    ProviderServiceDetailsEditController: (req, res) => {
        const { provider_id } = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderOdditGetServiceDetailsEditService(provider_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderServiceSubCatListController: (req, res) => {
        const { cat_id } = req.query;
        console.log(cat_id);
        if (!cat_id) {
            return res.status(400).json({ message: "Please provide category id" })
        }
        try {
            ProviderServiceSubCatListService(cat_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderAddSubCatController: (req, res) => {
        const { provider_id, cat_id, sub_cat_id } = req.body;
        console.log('req.body: ', req.body);
        console.log(typeof sub_cat_id);
        if (Array.isArray(sub_cat_id)) {
        } else if (typeof sub_cat_id === 'string') {
            sub_cat_id = JSON.parse(sub_cat_id);
        } else if (typeof sub_cat_id === 'object') {
            sub_cat_id = sub_cat_id.map(subCat => subCat.id);
        } else {
            return res.status(400).json({ message: "Invalid format for sub_cat_id" });
        }
        if (!provider_id || !cat_id || !sub_cat_id) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderAddSubCatService(provider_id, cat_id, sub_cat_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ message: result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderDeleteSubCatController: (req, res) => {
        const { provider_id, cat_id, sub_cat_id } = req.query;
        console.log(provider_id, cat_id, sub_cat_id);
        if (!provider_id || !cat_id || !sub_cat_id) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderDeleteSubCatService(provider_id, cat_id, sub_cat_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ message: result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({
                error: error.message
            });
        }

    },

    ProviderGetAddCategoryController: (req, res) => {
        const { provider_id } = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "Not Login" })
        }
        try {
            ProviderGetAddCategoryService(provider_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderDeleteCategoryController: (req, res) => {
        const { provider_id, cat_id, master_id } = req.query;
        console.log(provider_id, cat_id);
        if (!provider_id || !cat_id || !master_id) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderDeleteCategoryService(provider_id, cat_id, master_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ message: result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderMaterListController: (req, res) => {
        const { provider_id } = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide provider id" })
        }
        try {
            ProviderMaterListService(provider_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderCategoryListController: (req, res) => {
        const { provider_id, masterId } = req.query;
        console.log(provider_id, masterId);
        if (!provider_id || !masterId) {
            return res.status(400).json({ message: "providerid or masterId is null" })
        }
        try {
            ProviderCategoryListService(provider_id, masterId, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderSubCategoryListController: (req, res) => {
        const { provider_id, masterId, catId } = req.query;
        console.log(provider_id, masterId, catId);
        if (!provider_id || !masterId || !catId) {
            return res.status(400).json({ message: "providerid or masterId or catId is null" })
        }
        try {
            ProviderSubCategoryListService(provider_id, masterId, catId, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                res.status(200).json({ result })
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderOdditGetSubProviderController: (req, res) => {
        const { provider_id, masterId, catId, subCatId } = req.query;
        console.log(provider_id, masterId, catId, subCatId);
        if (!provider_id || !masterId || !catId || !subCatId) {
            return res.status(400).json({ message: "Please provide all the details" });
        }
        try {
            ProviderOdditGetSubProviderService(provider_id, masterId, catId, subCatId, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                if (result.length === 0) {
                    return res.status(400).json({ message: "No sub provider found" })
                }
                else { res.status(200).json({ result }) }
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    ProviderOdditGetAllTransactionsController: (req, res) => {
        const {provider_id} = req.query;
        console.log(provider_id);
        if (!provider_id) {
            return res.status(400).json({ message: "Please provide provider id" })
        }
        try {
            ProviderOdditGetAllTransactionsService(provider_id, (err, result) => {
                if (err) {
                    console.log('err: ', err);
                    res.status(500).json({ message: "Internal Server Error" })
                }
                if (result.length === 0) {
                    return res.status(400).json({ message: "No transaction found" })
                }
                else { res.status(200).json({ result }) }
            });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(400).json({ error: error.message });
        }
    }
}
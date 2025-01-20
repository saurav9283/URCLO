const express = require('express');
const { ProviderOdditController, ProviderStartingController, ProviderEndController, ProviderOdditAllJobsController, ProviderOdditEditController, ProviderOdditDetailsController, ProviderOdditFiggureController, ProviderOdditApprovalController, ProviderOdditPaymentStatusController, ProviderOdditServiceDetailsController, ProviderOdditByIDController, ProviderServiceDetailsEditController, ProviderServiceSubCatListController, ProviderAddSubCatController, ProviderDeleteSubCatController, ProviderGetAddCategoryController, ProviderDeleteCategoryController, ProviderMaterListController, ProviderCategoryListController, ProviderSubCategoryListController, ProviderOdditGetSubProviderController, ProviderOdditEditImagesController, ProviderOdditGetAllTransactionsController } = require('./provider.oddit.controller');
const upload = require('../../../lib/uploadFunction');

const router = express.Router();

router.get('/oddit/location', ProviderOdditController)
router.post('/oddit/start', ProviderStartingController)
router.post('/oddit/end', ProviderEndController)
router.get('/oddit/all-job', ProviderOdditAllJobsController)
router.get('/oddit/provider-details', ProviderOdditDetailsController)
router.post('/oddit/provider-service-details', ProviderOdditServiceDetailsController) // provider service details
router.put('/oddit/update-job', ProviderOdditEditController);
router.put('/oddit/update-job/image', upload.fields([
  { name: "providerImage", maxCount: 1 },
  { name: "images1", maxCount: 1 },
  { name: "images2", maxCount: 1 },
  { name: "images3", maxCount: 1 }
]), ProviderOdditEditImagesController);
router.get('/oddit/provider-figure', ProviderOdditFiggureController)

router.post('/oddit/job-approval', ProviderOdditApprovalController)
router.put('/oddit/update-payment-status', ProviderOdditPaymentStatusController);

router.get('/oddit/get-provider-oddit-details', ProviderOdditByIDController); // get provider oddit details by id
router.get('/oddit/get-service-detail/edit', ProviderServiceDetailsEditController) // get service details for edit
router.get('/oddit/getsub-cat-list', ProviderServiceSubCatListController)
router.post('/oddit/add-sub-cat', ProviderAddSubCatController)
router.delete('/oddit/delete-sub-cat', ProviderDeleteSubCatController)
router.get('/oddit/get-add-category', ProviderGetAddCategoryController)
router.delete('/oddit/delete-category', ProviderDeleteCategoryController)
router.get('/oddit-masterlist', ProviderMaterListController)
router.get('/oddit-categorylist', ProviderCategoryListController)
router.get('/oddit-subcategorylist', ProviderSubCategoryListController)
router.get('/oddit/get-sub-provider', ProviderOdditGetSubProviderController)
router.get('/oddit/all-transactions', ProviderOdditGetAllTransactionsController)

module.exports = router;

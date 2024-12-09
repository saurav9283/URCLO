const express = require('express');
const { ProviderOdditController, ProviderStartingController, ProviderEndController, ProviderOdditAllJobsController } = require('./provider.oddit.controller');

const router = express.Router();

router.get('/oddit/location', ProviderOdditController)
router.post('/oddit/start', ProviderStartingController)
router.post('/oddit/end', ProviderEndController)
router.get('/oddit/all-job' , ProviderOdditAllJobsController)
module.exports = router;
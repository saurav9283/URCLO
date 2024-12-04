const express = require('express');
const { ProviderOdditController, ProviderStartingController, ProviderEndController } = require('./provider.oddit.controller');

const router = express.Router();

router.get('/oddit/location', ProviderOdditController)
router.post('/oddit/start', ProviderStartingController)
router.post('/oddit/end', ProviderEndController)

module.exports = router;
const express = require('express');
const { ProviderOdditController } = require('./provider.oddit.controller');

const router = express.Router();

router.get('/oddit/location', ProviderOdditController)

module.exports = router;
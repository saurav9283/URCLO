const express = require('express');
const { providerNotifyController, getProviderNotivicationController } = require('./provider.notify.controller');

const router = express.Router();

router.post('/push/notify' , providerNotifyController)
router.get('/get/notification' , getProviderNotivicationController)

module.exports = router;

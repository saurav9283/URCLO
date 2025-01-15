const express = require('express');
const { AddSubProviderController, GetSubProviderConteroller, DeleteSubProviderController } = require('./sub-provider.controller');
const router = express.Router();

router.post("/subsequently/add-sub-provider" , AddSubProviderController);
router.get('/subsequently/get-sub-provider', GetSubProviderConteroller);
router.delete('/subsequently/delete-sub-provider', DeleteSubProviderController);

module.exports = router;
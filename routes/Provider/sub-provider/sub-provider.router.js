const express = require('express');
const { AddSubProviderController, GetSubProviderConteroller, DeleteSubProviderController, GetListSubProviderController } = require('./sub-provider.controller');
const router = express.Router();

router.post("/subsequently/add-sub-provider" , AddSubProviderController);
router.get('/subsequently/get-sub-provider', GetSubProviderConteroller);
router.delete('/subsequently/delete-sub-provider', DeleteSubProviderController);
router.get('/subsequently/list-sub-provider', GetListSubProviderController);

module.exports = router;
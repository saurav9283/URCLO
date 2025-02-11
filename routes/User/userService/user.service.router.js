const express = require('express');
const { getMasterserviceController, getCategoryController, getSubCategoryController } = require('./user.service.controller');

const router = express.Router();

router.get('/' , getMasterserviceController)
router.get('/category' , getCategoryController)
// router.get('/category/sub-cat' , getSubCategoryController)
router.get('/category/sub-cat/:cat_id' , getSubCategoryController)

module.exports = router;

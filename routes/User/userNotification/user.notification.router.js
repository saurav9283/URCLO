const express = require('express');
const { NotificationController } = require('./user.notification.controller');
// const {  } = require('./user.notification.controller');

const router = express.Router();

router.get('/graphql', NotificationController);

module.exports = router;

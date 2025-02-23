const express = require('express')
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');

const router = express.Router();

router.route('/getallusers').get(userController.getAllUsers);
router.route('/updateme').patch(authController.protect, userController.updateMe);
router.route('/deleteme').delete(authController.protect,userController.deleteMe);

module.exports = router;
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

const { verifyToken } = require('../middlewares');


router.post('/signup', UserController.signUpUser);
router.get('/all',UserController.getAllUsers)
router.get('/get',verifyToken,UserController.getUserProfile)
router.put('/update',verifyToken,UserController.updateUserProfile)
router.delete('/delete',UserController.deleteUserById)
router.post('/signin',UserController.signIn)
router.post('/forget',UserController.forgetPassword)
router.post('/verify',UserController.verifyOTP)
router.post('/reset',UserController.resetPassword)

module.exports = router;

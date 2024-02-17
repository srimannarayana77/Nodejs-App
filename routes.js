const express = require('express');
const router = express.Router();
const userController = require('./usercontrollers');
const { verifyToken } = require('./middlewares'); 

router.post('/', userController.SignUpUser)
router.get('/all',userController.getAllUsers)
router.get('/getProfile',verifyToken, userController.getUserProfile) 
router.put('/update',verifyToken, userController.updateUserProfile)
router.delete('/:id/delete', userController.deleteUserById)
router.post('/signin',userController.signin)
router.post('/forget',userController.forgetPassword)
router.post('/verify',userController.verifyOTP)
router.post('/reset',userController.resetPassword)
module.exports = router    
      
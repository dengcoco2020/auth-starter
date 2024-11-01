const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = Router()

router.get('/', (authController.protect), userController.getAllUsers)
router.get('/mobile/:mobileno', userController.validateMobileNumber)
router.get('/:id', (authController.protect), userController.getUser)
router.put('/update', (authController.protect), userController.updateUser)
router.post('/otp', userController.verifyOTP)
router.post('/otp/new', userController.regenerateOTP)
router.post('/fcm', (authController.protect), userController.updateFCMToken)

module.exports = router
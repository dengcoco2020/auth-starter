const { Router } = require('express')
const userController = require('../controllers/userController')


const router = Router()

router.get('/all', userController.user_get_all)

router.get('/one/:id', userController.user_get_one)

router.post('/signup', userController.user_create)

router.put('/update', userController.user_update)

router.delete('/delete/:id', userController.user_delete)

router.post('/validate', userController.user_validate)

router.post('/otpverify', userController.otp_verify)

router.post('/otpgenerate', userController.otp_generate)

module.exports = router
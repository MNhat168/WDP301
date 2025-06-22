import express from 'express'
import * as ctrls from '../controllers/userController.js'
import { verifyAccessToken } from '../middlewares/verifyToken.js'
import { isAdmin } from '../middlewares/verifyToken.js'
import uploadCloud from '../config/cloudinary.js'

const router = express.Router()

// Separate registration routes
router.post('/register-jobseeker', ctrls.registerJobseeker)
router.post('/register-employer', ctrls.registerEmployer)
router.post('/verify-register/:email', ctrls.verifyOtp)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.put('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.post('/forgotpassword', ctrls.forgotPassword)
router.post('/verify-forgot-pass/:email', ctrls.verifyOtpAndResetPassword)
router.get('/', [verifyAccessToken, isAdmin], ctrls.getAllUser)
router.put('/current', [verifyAccessToken], ctrls.updateUser)
router.post('/upload-image', [verifyAccessToken], uploadCloud.single('images'), ctrls.uploadImage)
//getuserbyid
router.post('/create-account-by-admin', [verifyAccessToken, isAdmin], ctrls.createAccountbyAdmin)
router.put('/:id', [verifyAccessToken, isAdmin], ctrls.updateUserbyAdmin)
router.put('/ban/:uid', [verifyAccessToken, isAdmin], ctrls.banUserByAdmin)

export default router
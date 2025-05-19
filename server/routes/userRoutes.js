const router = require('express').Router()
const ctrls = require('../controllers/userController')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

//method request
router.post('/register', ctrls.register)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.put('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.get('/forgotpassword', ctrls.forgotPassword)
router.put('/resetpassword', ctrls.resetPassword)
router.get('/', [verifyAccessToken, isAdmin] , ctrls.getAllUser)
router.delete('/', [verifyAccessToken, isAdmin] , ctrls.deleteUser)
router.put('/current', [verifyAccessToken] , ctrls.updateUser)
//getuserbyid
router.put('/:uid', [verifyAccessToken, isAdmin] , ctrls.updateUserbyAdmin)

module.exports = router
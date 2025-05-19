const User = require('../models/User')
const asyncHandler = require("express-async-handler")
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')

const register = asyncHandler( async (req, res) => {
    const { email, password, lastname, firstname, mobile } = req.body
    if(!email || !password || !firstname || !lastname || !mobile)
    return res.status(400).json({
        success: false,
        mes: "Missing input"
    })

    const user = await User.findOne({email, mobile})
    if(user)
        throw new Error('User has existed')
    else{
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser ? 'Create successfully' : 'Invalid information'
        })
    }
})
//RefreshToken => cấp mới accessToken
//AccessToken => Xác thực người dùng
const login = asyncHandler( async (req, res) => {
    const { email, password } = req.body
    if(!email || !password)
    return res.status(400).json({
        success: false,
        mes: "Missing input"
    })

    const response = await User.findOne({ email })
    if(response && await response.isCorrectPassword(password)){
        //Tách password và role ra khỏi response
        const { password, role, refreshToken, ...userData } = response.toObject()
        //Tạo access Token
        const accessToken = generateAccessToken(response._id, role)
        //Tạo refresh token
        const newrefreshToken = generateRefreshToken(response._id)
        //Lưu refreshToken vào db
        await User.findByIdAndUpdate(response._id, {refreshToken: newrefreshToken} , {new: true})
        //Lưu refreshToken vào cookie
        res.cookie('refreshToken', newrefreshToken, {httpOnly: true, maxAge: 720000})
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    }else{
        throw new Error('Invalid credential')
    }
})

const getCurrent = asyncHandler( async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    // const { _id } = req
    if( !cookie && cookie.refreshToken) throw new Error('No refresh Token in cookie')

    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh Token invalid'
    })
})

const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if(!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies')
    //Xóa refresh token ở db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ''}, {new: true})
    //Xóa refresh token ở trình duyệt
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        message: "Log out successfully"
    })
})

//Client gửi email
//Sever check email có hợp lệ hay không => Gửi mail và kèm theo link (password change token)
//Client check mail => click link
//Client gửi api kèm token
//Check token có giống với token mà sever gửi mail hay không
//Change password 

const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.query
    if( !email ) throw new Error('Missing email')
    const user = await User.findOne({ email })
    if(!user) throw new Error('User not found!! Invalid email')
    const resetToken = user.createPasswordChangeToken()
    await user.save()

    //Send mail
    const html = `Please click on below link to change your password!! Link will expired in 15 minutes from now 
        <br> <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here!!!</a>`
 
    const data = {
        email,
        html
    }

    const rs = await sendMail(data)
    return res.status(200).json({
        success: true,
        rs
    })
})

const resetPassword = asyncHandler(async(req, res) => {
    const { password, token } = req.body
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({passwordResetToken, passwordResetExpire: {$gt: Date.now()}})
    if(!user) throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExpire = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mes: user? 'Update password' : 'Something went wrong'
    })
})

//Lấy tất cả người dùng
const getAllUser = asyncHandler(async(req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})

//Xóa tài khoản
const deleteUser = asyncHandler(async(req, res) => {
    const {_id} = req.query
    if(!_id) throw new Error('Please modified Id!!!')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? `User with email ${response.email} had been deleted` : 'User not found'
    })
})

//Cập nhập tài khoản người dùng hiện tại
const updateUser = asyncHandler(async(req, res) => {
    const {_id} = req.user
    if(!_id || Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role')
    return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Something went wrong!!!!'
    })
})

//Cập nhập tài khoản người dùng bởi admin
const updateUserbyAdmin = asyncHandler(async(req, res) => {
    const { uid } = req.params
    if(Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(uid, req.body, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updateUser: response ? response : 'Something went wrong!!!!'
    })
})

const updateAddress = asyncHandler(async(req, res) => {
    const { _id } = req.user
    if(!req.body.address) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, {$push: {address: req.body.address}}, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Something went wrong!!!!'
    })
})

const addToCart = asyncHandler(async(req, res) => {
    const { _id } = req.user
    const {pid, quantity, color} = req.body
    if(!pid || !quantity || !color) throw new Error('Please modified information!!!')
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if(alreadyProduct){
        if(alreadyProduct.color === color){
            const response = await User.updateOne({cart: {$elemMatch: alreadyProduct}}, { $set: {"cart.$.quantity": quantity}}, {new: true})
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Something went wrong!!!!'
            })
        }else{
            const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new: true})
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Something went wrong!!!!'
            })
        }
    }else{
        const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            updatedUser: response ? response : 'Something went wrong!!!!'
        })
    }
})

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUser,
    deleteUser,
    updateUser,
    updateUserbyAdmin,
    updateAddress,
    addToCart
}
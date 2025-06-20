import { generateAccessToken, generateRefreshToken } from '../middlewares/jwt.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import sendMail from '../config/sendMail.js';
import Role from '../models/Role.js';

const register = asyncHandler(async(req, res) => {
    const { email, password, username, dateOfBirth, phone, firstname, lastname } = req.body;
    console.log(req.body);

    if (!email || !password || !dateOfBirth || !username || !phone || !firstname || !lastname)
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: "Missing input. Please provide: email, password, username, dateOfBirth, phone, firstname, lastname"
        });

    const user = await User.findOne({ email, phone });
    if (user) 
        throw new Error('User already exists');
    else {
        // Tìm roleId với tên 'ROLE_JOBSEEKER'
        const role = await Role.findOne({ roleName: 'ROLE_JOBSEEKER' });
        if (!role) {
            return res.status(500).json({
                status: false,
                code: 500,
                message: 'Role not found',
                result: "ROLE_JOBSEEKER role not found in database"
            });
        }

        // Tạo user data với roleId và convert field names
        const userData = {
            ...req.body,
            firstName: firstname,  // Convert to camelCase for model
            lastName: lastname,    // Convert to camelCase for model
            roleId: role._id
        };

        const newUser = new User(userData);
        const otp = newUser.createOtp(); // Tạo OTP
        await newUser.save();

        let type = 'verify_account'
        // Send mail
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EasyJob - Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                <!-- Header -->
                <div style="text-align: center; padding: 20px 0; background-color: #4a90e2; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">EasyJob</h1>
                    <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Your Career Journey Starts Here</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <h2 style="color: #333333; margin: 0 0 20px; font-size: 20px;">Hi ${firstname} ${lastname},</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #666666; margin: 0 0 15px; font-size: 16px; line-height: 1.5;">
                            Thank you for joining EasyJob! To complete your registration and start exploring job opportunities, please use the following verification code:
                        </p>
                        <div style="background-color: #4a90e2; color: #ffffff; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="color: #666666; margin: 0; font-size: 14px; font-style: italic;">
                            This code will expire in 10 minutes.
                        </p>
                    </div>

                    <p style="color: #666666; margin: 0 0 20px; font-size: 16px; line-height: 1.5;">
                        If you didn't request this verification code, you can safely ignore this email.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="#" style="background-color: #4a90e2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
                        <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
                        <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
                    </div>
                    
                    <p style="color: #666666; margin: 0 0 10px; font-size: 14px;">
                        &copy; 2024 EasyJob. All rights reserved.
                    </p>
                    
                    <div style="margin-top: 15px; font-size: 12px; color: #999999;">
                        <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                        <span style="color: #999999;">•</span>
                        <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                        <span style="color: #999999;">•</span>
                        <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Help Center</a>
                    </div>
                </div>
            </div>
        </body>
        </html>`;

        const data = { email, html, type };
        await sendMail(data);

        return res.status(200).json({
            status: true,
            code: 200,
            message: 'User created successfully. OTP sent to email.',
            result: newUser
        });
    }
});

const verifyOtp = asyncHandler(async(req, res) => {
    const { email} = req.params;
    console.log({email})
    const { otp } = req.body;
    console.log({otp})
    if (!email || !otp)
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: "Missing input"
        });

    const user = await User.findOne({ email });
    console.log({user})
    if (!user)
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User not found',
            result: "User not found"
        });

    if (!user.verifyOtp(otp)) {
        console.log("Invalid or expired OTP")
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid or expired OTP',
            result: "Invalid or expired OTP"
        });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isActive = true;
    await user.save();

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        result: user,
    });
});


// RefreshToken => cấp mới accessToken
// AccessToken => Xác thực người dùng
const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body
    if(!email || !password)
    return res.status(400).json({
        status: false,
        code: 400,
        message: 'Invalid input',
        result: "Missing input"
    })

    // Populate role để lấy roleName
    const response = await User.findOne({ email }).populate('roleId')
    if(!response) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User not found',
            result: 'Invalid information'
        })
    }

    if(response.isBlocked==true){
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'Account is blocked',
            result: 'Invalid information'
        })
    }

    if(response.isActive==false){
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'Account is not Active',
            result: 'Invalid information'
        })
    }

    if(response && await response.isCorrectPassword(password)){
        //Tách password và role ra khỏi response
        const { password, refreshToken, ...userData } = response.toObject()
        //Tạo access Token với roleName từ populated role
        const accessToken = generateAccessToken(response._id, response.roleId.roleName)
        //Tạo refresh token
        const newrefreshToken = generateRefreshToken(response._id)
        //Lưu refreshToken vào db
        await User.findByIdAndUpdate(response._id, {refreshToken: newrefreshToken} , {new: true})
        //Lưu refreshToken vào cookie
        res.cookie('refreshToken', newrefreshToken, {httpOnly: true, maxAge: 720000})
        return res.status(200).json({
            success: true,
            code: 200,
            accessToken,
            userData
        })
    }else{
        throw new Error('Invalid credential')
    }
})

const authGoogle = asyncHandler(async(req, res) => {
    const accessToken = generateAccessToken(req.user._id, req.user.role)
    console.log("CONTROLLER___:",accessToken)
    return res.status(200).json({
        success: true,
        code: 200,
        accessToken,
    })
})

const getCurrent = asyncHandler(async(req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password').populate('roleId')
    return res.status(200).json({
        status: user ? true : false,
        code: user ? 200 : 400,
        message : user ? 'User found' : 'User not found',
        result: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    // const { _id } = req
    if( !cookie && cookie.refreshToken) throw new Error('No refresh Token in cookie')

    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        status: response ? true : false,
        code: response? 200 : 400,
        message: response? 'Refresh token valid' : 'Refresh token invalid',
        result: response ? generateAccessToken(response._id, response.role) : 'Refresh Token invalid'
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
        code: 200,
        message: 'Log out successfully',
        result: 'Log out successfully'
    })
})

//New format change
//Client gửi email
//Sever check email có hợp lệ hay không => Gửi mail và kèm theo link (password change token)
//Client check mail => click link
//Client gửi api kèm token
//Check token có giống với token mà sever gửi mail hay không
//Change password 


const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.body;
    if (!email) throw new Error('Missing email');
    const user = await User.findOne({ email });
    console.log({email})
    if (!user) throw new Error('User not found!! Invalid email');
    const otp = user.createOtp()
    await user.save();
  
    let type = 'forgot_password'
    // Send mail
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EasyJob - Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; background-color: #4a90e2; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">EasyJob</h1>
                <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Your Career Journey Starts Here</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px 20px; background-color: #ffffff;">
                <h2 style="color: #333333; margin: 0 0 20px; font-size: 20px;">Hi ${user.username},</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #666666; margin: 0 0 15px; font-size: 16px; line-height: 1.5;">
                        You have requested a password reset for your TicketNest account. Please use the following OTP to reset your password:
                    </p>
                    <div style="background-color: #4a90e2; color: #ffffff; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666666; margin: 0; font-size: 14px; font-style: italic;">
                        This code will expire in 10 minutes.
                    </p>
                </div>

                <p style="color: #666666; margin: 0 0 20px; font-size: 16px; line-height: 1.5;">
                    If you didn't request this verification code, you can safely ignore this email.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background-color: #4a90e2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
                    <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Twitter" style="width: 24px; height: 24px;"></a>
                    <a href="#" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="LinkedIn" style="width: 24px; height: 24px;"></a>
                </div>
                
                <p style="color: #666666; margin: 0 0 10px; font-size: 14px;">
                    &copy; 2024 EasyJob. All rights reserved.
                </p>
                
                <div style="margin-top: 15px; font-size: 12px; color: #999999;">
                    <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                    <span style="color: #999999;">•</span>
                    <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                    <span style="color: #999999;">•</span>
                    <a href="#" style="color: #999999; text-decoration: none; margin: 0 10px;">Help Center</a>
                </div>
            </div>
        </div>
    </body>
    </html>`;

    const data = { email, html, type };
    await sendMail(data);
    
    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Send mail successfully',
        result:  'Send mail successfully',
    });
});

const verifyOtpAndResetPassword = asyncHandler(async(req, res) => {
    const { email} = req.params;
    const { otp, newPassword } = req.body;
    console.log({otp, newPassword});
    if (!email || !otp || !newPassword) throw new Error('Missing required fields')
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!user.verifyOtp(otp)) throw new Error('Invalid or expired OTP');

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    return res.status(200).json({
        status: user ? true : false,
        code: user ? 200 : 400,
        message: user? 'Update password' : 'Something went wrong',
        result: user,
    })
})

//Lấy tất cả người dùng
const getAllUser = asyncHandler(async(req, res) => {
    const response = await User.find().select('-refreshToken -password -role').populate('organizerRef')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400, 
        message: response ? 'Get all users' : 'Can not get all users', 
        result: response
    })
})

//Xóa tài khoản
const deleteUser = asyncHandler(async(req, res) => {
    const {_id} = req.query
    if(!_id) throw new Error('Please modified Id!!!')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Delete user successfully' : 'User not found',
        result: response ? `User with email ${response.email} had been deleted` : 'User not found'
    })
})

//Cập nhập tài khoản người dùng hiện tại
const updateUser = asyncHandler(async(req, res) => {
    const {_id} = req.user
    if(!_id || Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})

//Tạo tài khoản người dùng bởi admin
const createAccountbyAdmin = asyncHandler(async(req, res) => {
    const { username, email, password, role } = req.body
    if(Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.create({username, email, password, role})
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})


//Cập nhập tài khoản người dùng bởi admin
const updateUserbyAdmin = asyncHandler(async(req, res) => {
    const { _id } = req.params
    if(Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})

//Cấm tài khoản người dùng bởi user
const banUserByAdmin = asyncHandler(async(req, res) => {
    const { uid } = req.params
    if(!uid) throw new Error('Please modified Id!!!')
    const user = await User.findById(uid).select('-password -role -refreshToken')
    const isBlocked = !user.isBlocked
    const response = await User.findByIdAndUpdate(uid, {isBlocked}, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been ban` : 'Ban user failed',
        result: response ? response : 'Something went wrong!!!!'
    })
})


const uploadImage= asyncHandler(async(req, res) => {
    const { _id } = req.user
    if(!req.file) throw new Error('Missing input files')
    const response = await User.findByIdAndUpdate(_id, {$set: {images: req.file?.path}}, {new: true})
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Image uploaded successfully' : 'Can not upload image',
        result: response ? response : 'Can not upload file!!!!'
    })
})


const updateRolebyAdmin = asyncHandler(async(req, res) => {
    const { _id } = req.params
    if(!req.body.role) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, {role: req.body.role}, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Update role successfull' : 'Can not update role',
        result: response ? response : 'Something went wrong!!!!'
    })
})

export {
    register,
    verifyOtp,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyOtpAndResetPassword,
    getAllUser,
    deleteUser,
    updateUser,
    createAccountbyAdmin,
    updateUserbyAdmin,
    banUserByAdmin,
    uploadImage,
    updateRolebyAdmin,
};
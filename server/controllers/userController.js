import { generateAccessToken, generateRefreshToken } from '../middlewares/jwt.js';
import User from '../models/User.js';
import CompanyProfile from '../models/CompanyProfile.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import sendMail from '../config/sendMail.js';
import Role from '../models/Role.js';
import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';

// Đăng ký cho Job Seeker
const registerJobseeker = asyncHandler(async(req, res) => {
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

        // Auto assign free subscription
        try {
            const freePackage = await Subscription.findOne({ packageType: 'free' });
            if (freePackage) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + freePackage.duration);
                await UserSubscription.create({
                    userId: newUser._id,
                    subscriptionId: freePackage._id,
                    startDate: new Date(),
                    expiryDate: expiry,
                    status: 'active',
                    packageType: freePackage.packageType
                });
            }
        } catch (err) {
            console.error('Create free subscription failed:', err.message);
        }

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
                            Welcome to EasyJob! Thank you for joining our platform as a Job Seeker. To complete your registration and start exploring job opportunities, please use the following verification code:
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
            message: 'Job Seeker account created successfully. OTP sent to email.',
            result: newUser
        });
    }
});

// Đăng ký cho Employer
const registerEmployer = asyncHandler(async(req, res) => {
    const { email, password, username, dateOfBirth, phone, firstname, lastname, companyName, companyDescription } = req.body;
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
        // Tìm roleId với tên 'ROLE_EMPLOYEE'
        const role = await Role.findOne({ roleName: 'ROLE_EMPLOYEE' });
        if (!role) {
            return res.status(500).json({
                status: false,
                code: 500,
                message: 'Role not found',
                result: "ROLE_EMPLOYEE role not found in database"
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

        // Auto assign basic subscription for employer
        try {
            const basicPackage = await Subscription.findOne({ packageType: 'basic' });
            if (basicPackage) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + basicPackage.duration);
                await UserSubscription.create({
                    userId: newUser._id,
                    subscriptionId: basicPackage._id,
                    startDate: new Date(),
                    expiryDate: expiry,
                    status: 'active',
                    packageType: basicPackage.packageType
                });
            }
        } catch (err) {
            console.error('Create basic subscription failed:', err.message);
        }

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
                    <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Your Recruitment Partner</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <h2 style="color: #333333; margin: 0 0 20px; font-size: 20px;">Hi ${firstname} ${lastname},</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #666666; margin: 0 0 15px; font-size: 16px; line-height: 1.5;">
                            Welcome to EasyJob! Thank you for joining our platform as an Employer. To complete your registration and start posting job opportunities, please use the following verification code:
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
            message: 'Employer account created successfully. OTP sent to email.',
            result: newUser
        });
    }
});

const verifyOtp = asyncHandler(async(req, res) => {
    const { email} = req.params;
    const { otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: "Missing input"
        });

    const user = await User.findOne({ email });
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

    // FIX: Use findByIdAndUpdate to avoid triggering pre-save hook
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $unset: { otp: 1, otpExpire: 1 },
            $set: { isActive: true }
        },
        { new: true }
    );

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        result: updatedUser,
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

    let companyInfo = null
    if (response) {
        companyInfo = await CompanyProfile.findOne({ userId: response._id })
    }
    
    if(response && await response.isCorrectPassword(password)){
        //Tách password và role ra khỏi response
        const { password, refreshToken, ...userData } = response.toObject()
        userData.companyInfo = companyInfo;
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
    
    let companyInfo = null
    if (user) {
        companyInfo = await CompanyProfile.findOne({ userId: _id })
    }
    
    const result = user ? {
        ...user.toObject(),
        companyInfo: companyInfo || null
    } : null
    
    return res.status(200).json({
        status: user ? true : false,
        code: user ? 200 : 400,
        message : user ? 'User found' : 'User not found',
        result: result
    })
})

// Get user subscription limits and usage information
const getUserLimits = asyncHandler(async(req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id)
    
    if (!user) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User not found'
        })
    }

    try {
        const subscription = await user.getActiveSubscription()
        
        const limitsInfo = subscription ? {
            subscription: {
                type: subscription.packageType,
                status: subscription.status,
                startDate: subscription.startDate,
                expiryDate: subscription.expiryDate,
                daysRemaining: subscription.daysRemaining,
                autoRenew: subscription.autoRenew,
                isActive: subscription.isActive
            },
            applications: {
                used: subscription.usageStats.applicationsUsed,
                limit: subscription.packageType === 'enterprise' ? -1 : 
                  (subscription.packageType === 'premium' ? 50 : 
                   subscription.packageType === 'basic' ? 10 : 0),
                remaining: subscription.getRemainingApplications(),
                canApply: subscription.canApplyToJob()
            },
            jobPostings: {
                used: subscription.usageStats.jobPostingsUsed,
                limit: subscription.packageType === 'enterprise' ? -1 : 
                  (subscription.packageType === 'premium' ? 20 : 
                   subscription.packageType === 'basic' ? 5 : 0),
                remaining: subscription.getRemainingJobPostings(),
                canPost: subscription.canPostJob()
            },
            features: {
                hasUnlimitedApplications: subscription.packageType === 'enterprise',
                hasPriorityListing: ['premium', 'enterprise'].includes(subscription.packageType),
                canSeeJobViewers: ['premium', 'enterprise'].includes(subscription.packageType),
                hasAdvancedFilters: ['premium', 'enterprise'].includes(subscription.packageType),
                canDirectMessage: ['premium', 'enterprise'].includes(subscription.packageType)
            },
            lastUsed: subscription.usageStats.lastUsedDate
        } : {
            subscription: {
                type: 'free',
                status: 'none',
                startDate: null,
                expiryDate: null,
                daysRemaining: 0,
                autoRenew: false,
                isActive: false
            },
            applications: {
                used: user.usageLimits.monthlyApplications,
                limit: 5, // Free tier limit
                remaining: Math.max(0, 5 - user.usageLimits.monthlyApplications),
                canApply: user.usageLimits.monthlyApplications < 5
            },
            jobPostings: {
                used: 0,
                limit: 0, // Free users can't post jobs
                remaining: 0,
                canPost: false
            },
            features: {
                hasUnlimitedApplications: false,
                hasPriorityListing: false,
                canSeeJobViewers: false,
                hasAdvancedFilters: false,
                canDirectMessage: false
            },
            lastUsed: user.usageLimits.lastResetDate
        }

        // Add user analytics
        limitsInfo.analytics = {
            profileViews: user.analytics.profileViews,
            cvDownloads: user.analytics.cvDownloads,
            totalJobApplications: user.analytics.jobApplications,
            lastActivity: user.analytics.lastActivityDate,
            monthlyViews: user.analytics.monthlyViews
        }

        // Add favorite jobs info
        limitsInfo.favorites = {
            count: user.favoriteJobs.length,
            limit: 50, // General limit for favorites
            canAddMore: user.favoriteJobs.length < 50
        }

        return res.status(200).json({
            status: true,
            code: 200,
            message: 'User limits retrieved successfully',
            result: limitsInfo
        })
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            code: 500,
            message: 'Failed to get user limits',
            error: error.message
        })
    }
})

// Check if user can perform specific action
const checkUserPermission = asyncHandler(async(req, res) => {
    const { _id } = req.user
    const { action } = req.params // 'apply', 'post-job', 'add-favorite', etc.
    
    const user = await User.findById(_id)
    
    if (!user) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User not found'
        })
    }

    try {
        const subscription = await user.getActiveSubscription()
        let canPerform = false
        let message = ''
        let upgradeRequired = false

        switch (action) {
            case 'apply':
                if (subscription) {
                    canPerform = subscription.canApplyToJob()
                    message = canPerform ? 'Can apply to job' : 
                        `Application limit reached for ${subscription.packageType} plan`
                } else {
                    canPerform = user.usageLimits.monthlyApplications < 5
                    message = canPerform ? 'Can apply to job (free tier)' : 
                        'Monthly application limit reached. Upgrade to apply to more jobs.'
                    upgradeRequired = !canPerform
                }
                break

            case 'post-job':
                if (subscription) {
                    canPerform = subscription.canPostJob()
                    message = canPerform ? 'Can post job' : 
                        `Job posting limit reached for ${subscription.packageType} plan`
                } else {
                    canPerform = false
                    message = 'Subscription required to post jobs'
                    upgradeRequired = true
                }
                break

            case 'add-favorite':
                canPerform = user.favoriteJobs.length < 50
                message = canPerform ? 'Can add to favorites' : 'Favorites limit reached'
                break

            default:
                return res.status(400).json({
                    status: false,
                    code: 400,
                    message: 'Invalid action specified'
                })
        }

        return res.status(200).json({
            status: true,
            code: 200,
            message: message,
            result: {
                action: action,
                canPerform: canPerform,
                upgradeRequired: upgradeRequired,
                subscriptionType: subscription ? subscription.packageType : 'free'
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            code: 500,
            message: 'Failed to check user permission',
            error: error.message
        })
    }
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


const uploadImage = asyncHandler(async(req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      status: false,
      message: 'No file uploaded' 
    });
  }
  
  try {
    const { _id } = req.user;
    // Return the secure URL directly
    const imageUrl = req.file.path;
    
    const response = await User.findByIdAndUpdate(
      _id, 
      {$set: {images: imageUrl}}, 
      {new: true}
    );
    
    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Image uploaded successfully',
      result: response
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      status: false,
      message: 'Image upload failed'
    });
  }
});


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

// Change password (authenticated)
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: 'Please provide currentPassword and newPassword'
        });
    }

    try {
        const { _id } = req.user;
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: 'User not found',
                result: 'User not found'
            });
        }

        const isMatch = await user.isCorrectPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: 'Current password is incorrect',
                result: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            status: true,
            code: 200,
            message: 'Password changed successfully',
            result: 'Password changed successfully'
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Change password failed',
            result: error.message
        });
    }
});

// Get favorite jobs
const getFavoriteJobs = asyncHandler(async (req, res) => {
    const { _id } = req.user;
  
    try {
        const user = await User.findById(_id).populate({
            path: 'favoriteJobs.jobId',
            populate: {
              path: 'companyId',
              select: 'companyName address url'
            }
          });

        if (!user) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: 'User not found',
                result: 'User not found'
            });
        }

        // Filter out null jobs (deleted jobs) and map the rest
        const favoriteJobs = user.favoriteJobs
            .filter(fav => fav.jobId) // Only include if job still exists
            .map(fav => ({
                ...fav.jobId.toObject(),
                favoriteDate: fav.favoriteDate
            }));
  
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'Get favorite jobs successfully',
        result: favoriteJobs
      });
    } catch (error) {
        console.error('Get favorite jobs error:', error);
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Get favorite jobs failed',
            result: error.message
        });
    }
});

// Get user stats for admin
const getUserStatsForAdmin = asyncHandler(async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const jobSeekerRole = await Role.findOne({ roleName: 'ROLE_JOBSEEKER' });
        const employerRole = await Role.findOne({ roleName: 'ROLE_EMPLOYEE' });
        
        const totalJobSeekers = jobSeekerRole 
            ? await User.countDocuments({ roleId: jobSeekerRole._id }) 
            : 0;
            
        const totalEmployers = employerRole 
            ? await User.countDocuments({ roleId: employerRole._id }) 
            : 0;
            
        const bannedUsers = await User.countDocuments({ isBlocked: true });

        res.status(200).json({
            status: true,
            result: {
                totalUsers,
                totalJobSeekers,
                totalEmployers,
                bannedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

const getUsersByRole = asyncHandler(async (req, res) => {
    try {
        const { role } = req.query;
        let roleName;
        let query = {};

        if (role === 'jobseekers') {
            roleName = 'ROLE_JOBSEEKER';
        } else if (role === 'employers') {
            roleName = 'ROLE_EMPLOYEE';
        }

        if (roleName) {
            const roleDoc = await Role.findOne({ roleName });
            if (!roleDoc) return res.status(404).json({ status: false, message: 'Role not found' });
            query.roleId = roleDoc._id;
        }

        const users = await User.find(query)
            .select('_id firstName lastName email isBlocked createdAt')
            .lean();

        res.status(200).json({
            status: true,
            result: users.map(user => ({
                ...user,
                userId: user._id,
                status: user.isBlocked ? 'banned' : 'active'
            }))
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

const toggleBanUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ status: false, message: 'User not found' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        
        res.status(200).json({
            status: true,
            result: {
                userId: user._id,
                status: user.isBlocked ? 'banned' : 'active'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
});
  
export {
    registerJobseeker,
    registerEmployer,
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
    changePassword,
    getFavoriteJobs,
    getUserStatsForAdmin,
    getUsersByRole,
    toggleBanUser,
    getUserLimits,
    checkUserPermission
};
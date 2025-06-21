import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Create payment intent for subscription
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { 
    subscriptionId, 
    billingPeriod = 'monthly', 
    paymentMethod = 'stripe' 
  } = req.body;
  
  try {
    const subscription = await Subscription.findById(subscriptionId);
    const user = await User.findById(_id).populate('roleId');
    
    if (!subscription || !subscription.isActive) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Subscription plan not found',
        result: 'Invalid subscription plan'
      });
    }
    
    // Determine user type and calculate amount
    const userType = user.roleId.name === 'ROLE_EMPLOYEE' ? 'employer' : 'jobSeeker';
    const amount = billingPeriod === 'yearly' 
      ? subscription.pricing[userType].yearly 
      : subscription.pricing[userType].monthly;
    
    // Apply any current promotions
    let finalAmount = amount;
    if (subscription.promotions.isOnSale && subscription.promotions.saleEndsAt > new Date()) {
      finalAmount = amount * (1 - subscription.promotions.saleDiscount / 100);
    }
    
    // For demo purposes - in real app you would integrate with Stripe
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userId: _id,
        subscriptionId: subscriptionId,
        userType: userType,
        billingPeriod: billingPeriod,
        originalAmount: amount,
        discount: amount - finalAmount
      }
    };

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Payment intent created successfully',
      result: {
        paymentIntent,
        subscription: {
          name: subscription.packageName,
          type: subscription.packageType,
          originalPrice: amount,
          finalPrice: finalAmount,
          discount: amount - finalAmount,
          billingPeriod
        }
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Create payment intent failed',
      result: error.message
    });
  }
});

// Confirm payment and activate subscription
const confirmPayment = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { 
    paymentIntentId, 
    subscriptionId, 
    billingPeriod = 'monthly' 
  } = req.body;
  
  try {
    // In real app, you would verify payment with Stripe
    // For demo purposes, we'll simulate successful payment
    
    const subscription = await Subscription.findById(subscriptionId);
    const user = await User.findById(_id).populate('roleId');
    
    if (!subscription) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Subscription plan not found',
        result: 'Invalid subscription plan'
      });
    }
    
    // Calculate pricing
    const userType = user.roleId.name === 'ROLE_EMPLOYEE' ? 'employer' : 'jobSeeker';
    const amount = billingPeriod === 'yearly' 
      ? subscription.pricing[userType].yearly 
      : subscription.pricing[userType].monthly;
    
    // Apply promotions
    let finalAmount = amount;
    if (subscription.promotions.isOnSale && subscription.promotions.saleEndsAt > new Date()) {
      finalAmount = amount * (1 - subscription.promotions.saleDiscount / 100);
    }
    
    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findActiveByUserId(_id);
    if (existingSubscription) {
      // Upgrade existing subscription
      await existingSubscription.upgradeSubscription(subscription.packageType, {
        billing: { 
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          lastPaymentDate: new Date()
        },
        paidAmount: finalAmount
      });
      
      var userSubscription = existingSubscription;
    } else {
      // Create new subscription
      const duration = billingPeriod === 'yearly' ? 365 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);
      
      userSubscription = new UserSubscription({
        userId: _id,
        subscriptionId: subscriptionId,
        packageType: subscription.packageType,
        status: 'active',
        paidAmount: finalAmount,
        paymentMethod: 'stripe',
        expiryDate: expiryDate,
        billing: {
          customerStripeId: `cus_${Date.now()}`,
          subscriptionStripeId: `sub_${Date.now()}`,
          lastPaymentDate: new Date(),
          nextPaymentDate: expiryDate,
          paymentStatus: 'paid'
        }
      });
      
      await userSubscription.save();
    }
    
    // Update user premium features
    user.premiumFeatures = {
      hasUnlimitedApplications: subscription.features_config.canApplyUnlimited,
      hasPriorityListing: subscription.features_config.hasPriorityListing,
      canSeeJobViewers: subscription.features_config.canSeeJobViewers,
      hasAdvancedFilters: subscription.features_config.hasAdvancedFilters,
      canDirectMessage: subscription.features_config.canDirectMessage
    };
    await user.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Payment confirmed and subscription activated',
      result: {
        subscription: userSubscription,
        activatedFeatures: user.premiumFeatures,
        paymentDetails: {
          amount: finalAmount,
          billingPeriod: billingPeriod,
          nextBillingDate: userSubscription.billing.nextPaymentDate
        }
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Confirm payment failed',
      result: error.message
    });
  }
});

// Get payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    const paymentHistory = await UserSubscription.find({ userId: _id })
      .populate('subscriptionId', 'packageName packageType')
      .sort({ createdAt: -1 });

    const formattedHistory = paymentHistory.map(payment => ({
      id: payment._id,
      planName: payment.subscriptionId.packageName,
      planType: payment.subscriptionId.packageType,
      amount: payment.paidAmount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.billing.lastPaymentDate,
      nextPaymentDate: payment.billing.nextPaymentDate,
      startDate: payment.startDate,
      expiryDate: payment.expiryDate
    }));

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get payment history successfully',
      result: formattedHistory
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get payment history failed',
      result: error.message
    });
  }
});

// Simulate free trial activation
const activateFreeTrial = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { subscriptionId } = req.body;
  
  try {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription || subscription.promotions.freeTrialDays === 0) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Free trial not available for this plan',
        result: 'No free trial available'
      });
    }
    
    // Check if user already has or had a subscription
    const existingSubscription = await UserSubscription.findOne({ userId: _id });
    if (existingSubscription) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Free trial already used or subscription exists',
        result: 'Trial not available'
      });
    }
    
    // Create free trial subscription
    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() + subscription.promotions.freeTrialDays);
    
    const trialSubscription = new UserSubscription({
      userId: _id,
      subscriptionId: subscriptionId,
      packageType: subscription.packageType,
      status: 'trial',
      paidAmount: 0,
      paymentMethod: 'trial',
      expiryDate: trialExpiryDate,
      billing: {
        paymentStatus: 'trial'
      }
    });
    
    await trialSubscription.save();
    
    // Update user premium features for trial
    const user = await User.findById(_id);
    user.premiumFeatures = {
      hasUnlimitedApplications: subscription.features_config.canApplyUnlimited,
      hasPriorityListing: subscription.features_config.hasPriorityListing,
      canSeeJobViewers: subscription.features_config.canSeeJobViewers,
      hasAdvancedFilters: subscription.features_config.hasAdvancedFilters,
      canDirectMessage: subscription.features_config.canDirectMessage
    };
    await user.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Free trial activated successfully',
      result: {
        trialSubscription,
        trialDaysRemaining: subscription.promotions.freeTrialDays,
        expiryDate: trialExpiryDate,
        activatedFeatures: user.premiumFeatures
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Activate free trial failed',
      result: error.message
    });
  }
});

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  activateFreeTrial
}; 
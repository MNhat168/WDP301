import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import paypalClient from '../config/paypalClient.js';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

/**
 * Capture PayPal payment and activate subscription
 */
const capturePayPalPayment = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { orderId, payerId } = req.body;

  if (!orderId || !payerId) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'orderId and payerId are required',
      result: null
    });
  }

  try {
    // Use paypalClient instead of PayPalService
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const captureOrderResponse = await paypalClient.client().execute(request);

    if (captureOrderResponse.result.status !== 'COMPLETED') {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Payment capture failed',
        result: captureOrderResponse.result
      });
    }

    const userSubscription = await UserSubscription.findOne({
      userId: _id,
      'billing.paypalOrderId': orderId,
      status: 'pending'
    }).populate('subscriptionId');

    if (!userSubscription) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Pending subscription not found',
        result: null
      });
    }

    userSubscription.status = 'active';
    userSubscription.billing.paymentStatus = 'paid';
    userSubscription.billing.paypalPaymentId = captureOrderResponse.result.id;
    userSubscription.billing.paypalPayerId = payerId;
    userSubscription.billing.lastPaymentDate = new Date();
    await userSubscription.save();

    if (userSubscription.packageType !== 'free') {
      const user = await User.findById(_id);
      user.premiumFeatures = {
        hasUnlimitedApplications: userSubscription.subscriptionId.features_config?.canApplyUnlimited || false,
        hasPriorityListing:       userSubscription.subscriptionId.features_config?.hasPriorityListing || false,
        canSeeJobViewers:         userSubscription.subscriptionId.features_config?.canSeeJobViewers || false,
        hasAdvancedFilters:       userSubscription.subscriptionId.features_config?.hasAdvancedFilters || false,
        canDirectMessage:         userSubscription.subscriptionId.features_config?.canDirectMessage || false
      };
      await user.save();
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Payment confirmed and subscription activated',
      result: {
        subscription: userSubscription,
        paymentId: captureOrderResponse.result.id,
        amount: captureOrderResponse.result.purchase_units[0].payments.captures[0].amount.value
      }
    });
  } catch (error) {
    // Handle specific PayPal errors
    if (error.statusCode === 422 && error._originalError?.text.includes('ORDER_ALREADY_CAPTURED')) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Order already captured',
        result: null
      });
    }

    console.error('Payment capture error:', error);
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Payment processing failed',
      result: error.message
    });
  }
});

/**
 * Create PayPal payment order for subscription
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { subscriptionId, amount } = req.body;

  if (!subscriptionId || !amount) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'subscriptionId and amount are required',
      result: null
    });
  }

  try {
    // Create a pending user subscription first
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Subscription plan not found',
        result: null
      });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: _id.toString(),
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          },
          description: `Subscription: ${subscription.packageName}`
        }
      ],
      application_context: {
        return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-callback`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/packages`
      }
    });

    const createOrderResponse = await paypalClient.client().execute(request);
    const paymentUrl = createOrderResponse.result.links.find(
      (link) => link.rel === 'approve'
    )?.href;

    // Create pending user subscription
    const userSubscription = new UserSubscription({
      userId: _id,
      subscriptionId,
      packageType: subscription.packageType,
      status: 'pending',
      paidAmount: amount,
      paymentMethod: 'paypal',
      billing: {
        paypalOrderId: createOrderResponse.result.id,
        paymentStatus: 'pending'
      }
    });
    await userSubscription.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Payment order created successfully',
      result: {
        orderId: createOrderResponse.result.id,
        paymentUrl: paymentUrl,
        userSubscription: userSubscription
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Create payment order failed',
      result: error.message
    });
  }
});

/**
 * Confirm PayPal payment (legacy)
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const { orderId, payerId } = req.body;
  if (!orderId || !payerId) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'orderId and payerId are required',
      result: null
    });
  }
  // Delegate to new handler
  req.body = { orderId, payerId };
  return capturePayPalPayment(req, res);
});

/**
 * Get payment history for current user
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const history = await UserSubscription.find({ userId: _id })
      .populate('subscriptionId', 'packageName packageType')
      .sort({ createdAt: -1 });

    const formatted = history.map(item => ({
      id:              item._id,
      planName:        item.subscriptionId.packageName,
      planType:        item.subscriptionId.packageType,
      amount:          item.paidAmount,
      status:          item.status,
      paymentMethod:   item.paymentMethod,
      paymentDate:     item.billing.lastPaymentDate,
      nextPaymentDate: item.billing.nextPaymentDate,
      startDate:       item.startDate,
      expiryDate:      item.expiryDate
    }));

    return res.status(200).json({
      status:  true,
      code:    200,
      message: 'Payment history retrieved successfully',
      result:  formatted
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(400).json({
      status:  false,
      code:    400,
      message: 'Get payment history failed',
      result:  error.message
    });
  }
});

/**
 * Activate free trial subscription
 */
const activateFreeTrial = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'subscriptionId is required',
      result: null
    });
  }

  try {
    const plan = await Subscription.findById(subscriptionId);
    if (!plan || plan.promotions.freeTrialDays === 0) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Free trial not available for this plan',
        result: null
      });
    }

    const existing = await UserSubscription.findOne({ userId: _id });
    if (existing) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Free trial already used or subscription exists',
        result: null
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.promotions.freeTrialDays);

    const trial = new UserSubscription({
      userId:       _id,
      subscriptionId,
      packageType:  plan.packageType,
      status:       'trial',
      paidAmount:   0,
      paymentMethod:'trial',
      expiryDate:   expiry,
      billing: { paymentStatus: 'trial' }
    });
    await trial.save();

    const user = await User.findById(_id);
    user.premiumFeatures = {
      hasUnlimitedApplications: plan.features_config.canApplyUnlimited,
      hasPriorityListing:       plan.features_config.hasPriorityListing,
      canSeeJobViewers:         plan.features_config.canSeeJobViewers,
      hasAdvancedFilters:       plan.features_config.hasAdvancedFilters,
      canDirectMessage:         plan.features_config.canDirectMessage
    };
    await user.save();

    return res.status(200).json({
      status:  true,
      code:    200,
      message: 'Free trial activated successfully',
      result: {
        trialSubscription: trial,
        trialDaysRemaining: plan.promotions.freeTrialDays,
        expiryDate: expiry,
        activatedFeatures: user.premiumFeatures
      }
    });
  } catch (error) {
    console.error('Activate free trial error:', error);
    return res.status(400).json({
      status: false,
      code:   400,
      message:'Activate free trial failed',
      result: error.message
    });
  }
});

export {
  createPaymentIntent,
  confirmPayment,
  capturePayPalPayment,
  getPaymentHistory,
  activateFreeTrial
};

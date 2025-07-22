# PayPal Sandbox Setup Guide

## 🚀 Quick Setup Steps

### 1. Create PayPal Developer Account
- Go to [developer.paypal.com](https://developer.paypal.com/)
- Sign in with your PayPal account or create a new one
- Accept developer terms

### 2. Create Sandbox Application
1. Navigate to **My Apps & Credentials**
2. Click **Create App**
3. Fill in the details:
   - **App Name**: `EasyJob-Sandbox`
   - **Environment**: `Sandbox`
   - **Merchant**: Select default business account
   - **Features**: Check `Payments`
4. Click **Create App**

### 3. Get Your Credentials
After creating the app, you'll see:
- **Client ID**: `AUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...`
- **Client Secret**: `EPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...`

### 4. Update Environment Variables
Add these to your `.env` file:

```env
# PayPal Sandbox Configuration
PAYPAL_CLIENT_ID=AU_your_actual_client_id_here
PAYPAL_CLIENT_SECRET=EP_your_actual_client_secret_here
PAYPAL_ENVIRONMENT=sandbox
FRONTEND_URL=http://localhost:3000

# Disable mock mode (remove this line to enable mock mode)
USE_MOCK_PAYPAL=false
```

### 5. Test Sandbox Accounts
PayPal automatically creates test accounts:
- **Business Account**: For receiving payments
- **Personal Account**: For making test payments

You can view these at: **Sandbox** → **Accounts**

### 6. Test Payment Flow
1. Restart your server: `npm start`
2. Go to frontend packages page
3. Click upgrade on any paid plan
4. You'll be redirected to PayPal sandbox
5. Use sandbox personal account to test payment

## 🧪 Mock Mode (Current Setup)

Currently running in **MOCK MODE** because no real PayPal credentials are configured.

**Mock Features:**
- ✅ No real PayPal authentication required
- ✅ Simulates payment flow for testing
- ✅ Creates mock payment URLs
- ✅ Subscription activation works normally
- ⚠️ No real money transactions

**Mock Payment URL Example:**
```
http://localhost:3000/payment/success?token=MOCK_PAY_123&PayerID=MOCK_PAYER_123
```

## 🔧 Environment Variables

```env
# Required for real PayPal integration
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret

# Optional settings
PAYPAL_ENVIRONMENT=sandbox                    # sandbox or live
USE_MOCK_PAYPAL=false                        # true to enable mock mode
FRONTEND_URL=http://localhost:3000           # for return URLs
```

## 🚨 Important Notes

1. **Sandbox vs Live**: Always use `sandbox` for development
2. **Client ID Format**: Should start with `AU` (Application User)
3. **Client Secret Format**: Should start with `EP` (Encrypted Password)
4. **Return URLs**: Must match your frontend URL exactly
5. **Security**: Never commit real credentials to git

## 🐛 Troubleshooting

### Error: "Client Authentication failed"
- Verify Client ID and Secret are correct
- Ensure no extra spaces in .env file
- Check that credentials are for sandbox environment

### Error: "Invalid return URL"
- Make sure `FRONTEND_URL` matches your actual frontend URL
- PayPal requires exact URL matching

### Mock Mode Not Working
- Set `USE_MOCK_PAYPAL=true` in .env
- Or remove `PAYPAL_CLIENT_ID` from .env
- Restart server after changes

## 📞 Support

If you need help:
1. Check PayPal Developer Documentation
2. Verify credentials in PayPal Developer Dashboard
3. Test with mock mode first
4. Check server logs for detailed error messages 
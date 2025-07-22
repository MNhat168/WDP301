import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not found in environment variables');
    }
    
    console.log('\n--- PAYPAL CLIENT INITIALIZATION ---');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.PAYPAL_MODE === 'live' ? 'Live' : 'Sandbox'}`);
    console.log(`Client ID: ${clientId.substring(0, 10)}...`);
    console.log('-------------------------------------\n');
    
    if (process.env.PAYPAL_MODE === 'live') {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
    
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

export default { client };
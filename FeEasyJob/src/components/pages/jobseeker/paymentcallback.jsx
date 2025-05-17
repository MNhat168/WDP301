import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const BanPopup = useBanCheck();
    
    useEffect(() => {
        const status = searchParams.get('status');
        const reason = searchParams.get('reason');
        
        console.log('Payment callback received:', { status, reason });
    
        if (status === 'success') {
            setStatus('success');
            // Fetch updated package information
            fetch('http://localhost:8080/listUserPackage', {
                credentials: 'include'
            })
            .then(res => res.json())
            .catch(err => {
                console.error('Error fetching updated package:', err);
                setStatus('failed');
            });
        } else {
            setStatus('failed');
            let errorMessage;
            switch(reason) {
                case 'invalid_signature':
                    errorMessage = 'Invalid payment signature';
                    break;
                case 'missing_response_code':
                    errorMessage = 'Missing payment response';
                    break;
                case 'session_expired':
                    errorMessage = 'Session expired';
                    break;
                case 'processing_error':
                    errorMessage = 'Error processing payment';
                    break;
                default:
                    errorMessage = reason || 'An unknown error occurred';
            }
            console.error('Payment failed:', errorMessage);
        }
    
        // Redirect after delay
        setTimeout(() => {
            navigate('/packages');
        }, 3000);
    }, [searchParams, navigate]);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    {status === 'processing' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-lg text-gray-700">Processing your payment...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-gray-800">Payment Successful!</h2>
                            <p className="mt-2 text-gray-600">Your package has been upgraded successfully.</p>
                            <p className="mt-4 text-sm text-gray-500">Redirecting back to packages...</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-gray-800">Payment Failed</h2>
                            <p className="mt-2 text-gray-600">There was an error processing your payment.</p>
                            <p className="mt-4 text-sm text-gray-500">Redirecting back to packages...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PaymentCallback;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BanPopup = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl transform animate-fadeIn">
                <div className="text-center">
                    {/* Warning Icon */}
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        Account Banned
                    </h3>
                    
                    {/* Message */}
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Your account has been banned due to violation of our terms. 
                            Please contact support for assistance.
                        </p>
                    </div>
                    
                    {/* Button */}
                    <div className="mt-5">
                        <button
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const useBanCheck = () => {
    const navigate = useNavigate();
    const [showBanPopup, setShowBanPopup] = useState(false);

    useEffect(() => {
        const checkBanStatus = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;

            try {
                const response = await axios.get(`http://localhost:8080/admin/users/check-status/${user.userId}`, {
                    withCredentials: true
                });

                if (response.data.status === 'banned') {
                    localStorage.removeItem('user');
                    setShowBanPopup(true);
                }
            } catch (error) {
                console.error('Error checking ban status:', error);
            }
        };

        const interval = setInterval(checkBanStatus, 5000);
        return () => clearInterval(interval);
    }, [navigate]);

    // Render the popup if showBanPopup is true
    return showBanPopup ? (
        <BanPopup onClose={() => {
            setShowBanPopup(false);
            navigate('/login');
        }} />
    ) : null;
};

export default useBanCheck;
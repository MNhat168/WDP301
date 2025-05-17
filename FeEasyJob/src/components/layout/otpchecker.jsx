import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import logoWithoutText from '../../../assets/images/easyjobwithouttext.png';

const OTPVerificationModal = ({ onSuccess, onClose, isEmployer = false }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(180);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const timer = timeLeft > 0 && setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        if (timeLeft === 0) {
            setIsResendDisabled(false);
        }

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleInputChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) {
                document.querySelector(`input[name=otp-input${index + 2}]`).focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.querySelector(`input[name=otp-input${index}]`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            if (isEmployer) {
                const formData = new FormData();
                otp.forEach((digit, index) => {
                    formData.append(`otp-input${index + 1}`, digit);
                });

                const response = await fetch('http://localhost:8080/verify-otp-employer', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Invalid OTP');
                }
            } else {
                const response = await fetch('http://localhost:8080/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ otp: otp.join('') })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Invalid OTP');
                }
            }

            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to verify OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        setIsVerifying(true);
        try {
            const endpoint = isEmployer ? '/resend-otp-employer' : '/resend-otp';
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to resend OTP');
            }

            setTimeLeft(60);
            setIsResendDisabled(true);
            setSuccess('OTP has been resent successfully');
        } catch (err) {
            setError(err.message || 'Failed to verify OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            name={`otp-input${index + 1}`}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            maxLength={1}
                            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7808d0]"
                            required
                        />
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-gray-600 mb-2">
                        Time remaining: <span className="text-red-500 font-bold">{timeLeft}s</span>
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResendDisabled || isResending}
                        className={`text-[#7808d0] hover:text-[#6507af] flex items-center justify-center mx-auto ${isResendDisabled || isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isResending ? (
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : null}
                        {isResending ? 'Resending...' : 'Resend Code'}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-[#7808d0] hover:bg-[#6507af] text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    {isVerifying ? (
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : null}
                    {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    );
};

export default OTPVerificationModal;
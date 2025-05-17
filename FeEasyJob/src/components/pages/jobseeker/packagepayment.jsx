import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const PackagePayment = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [paymentDetails, setPaymentDetails] = useState({
        amount: 0,
        bankCode: '',
        language: 'vn'
    });
    const BanPopup = useBanCheck();
    
    useEffect(() => {
        fetchPackagePrice();
    }, [packageId]);

    const fetchPackagePrice = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(`http://localhost:8080/upgrade?idPackage=${packageId}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPaymentDetails(prev => ({
                    ...prev,
                    amount: data.price
                }));
            }
        } catch (error) {
            console.error('Error fetching package price:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('http://localhost:8080/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(paymentDetails)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.code === '00') {
                    window.location.href = data.data; // Redirect to VNPAY payment page
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 mt-20">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6">Pay With VNPAY</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Pay (VND)
                            </label>
                            <input
                                type="number"
                                value={paymentDetails.amount}
                                readOnly
                                className="w-full p-3 border rounded-md bg-gray-50"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Payment Method</h3>
                            
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="bankCode"
                                        value=""
                                        checked={paymentDetails.bankCode === ''}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>VNPAYQR Payment Gateway</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="bankCode"
                                        value="VNBANK"
                                        checked={paymentDetails.bankCode === 'VNBANK'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>Domestic ATM Card/Account</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="bankCode"
                                        value="INTCARD"
                                        checked={paymentDetails.bankCode === 'INTCARD'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>International Card</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Language</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="language"
                                        value="vn"
                                        checked={paymentDetails.language === 'vn'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>Tiếng Việt</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="language"
                                        value="en"
                                        checked={paymentDetails.language === 'en'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>English</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Proceed to Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/packages')}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PackagePayment;
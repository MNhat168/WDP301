import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const PackageList = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: 0,
        bankCode: '',
        language: 'vn'
    });
    const BanPopup = useBanCheck();
    
    useEffect(() => {
        fetch('http://localhost:8080/listUserPackage', {
            credentials: 'include',  // Add this line
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setPackages(data.listP || []);
                setCurrentPackage(data.pack || null);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching packages:', err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            });
    }, [navigate]);
    
    const handleUpgradeClick = (pkg) => {
        fetch('http://localhost:8080/user/current', {
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Not authenticated');
            }
            return res.json();
        })
        .then(() => {
            setSelectedPackage(pkg);
            setPaymentDetails(prev => ({
                ...prev,
                amount: pkg.price,
                idPackage: pkg.packageId
            }));
            setShowPaymentModal(true);
        })
        .catch(() => {
            alert('Please log in to proceed with the payment.');
            navigate('/login');
        });
    };

    // Add this PaymentModal component inside PackageList
    const PaymentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Pay With VNPAY</h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
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
                            onClick={() => setShowPaymentModal(false)}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('amount', paymentDetails.amount);
            formData.append('bankCode', paymentDetails.bankCode || '');
            formData.append('language', paymentDetails.language || 'vn');
            formData.append('idPackage', selectedPackage.packageId);

            const response = await fetch('http://localhost:8080/payment', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Payment initialization failed');
            }

            const result = await response.json();

            if (result.code === "00") {
                window.location.href = result.data;
            } else {
                throw new Error(result.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment initialization failed. Please try again.');
        }
    };

    // Add the handleInputChange function
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <Header />
            <div id="generic_price_table" className="bg-[#f0eded] min-h-screen font-['Raleway']">
                <section className="mt-[120px]">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="price-heading clearfix">
                                <h1 className="text-[#666] text-3xl font-light">
                                    Upgrade Service Package
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center">
                            {packages.map((pkg) => (
                                <div key={pkg.packageId} className="w-full md:w-1/3 px-4 mb-8">
                                    <div className="generic_content bg-white overflow-hidden text-center transition-all duration-300 hover:-translate-y-2">
                                        {/* Head Price Section */}
                                        <div className="bg-[#f6f6f6] mb-5">
                                            {/* Head Content */}
                                            <div className="relative mb-12">
                                                <div className="head_bg absolute border-[#e4e4e4] border-solid"></div>
                                                <div className="pt-10 relative z-10">
                                                    <span className="text-[#525252] text-2xl font-normal tracking-wider uppercase">
                                                        {pkg.packageName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price Tag */}
                                            <div className="pb-5">
                                                <div className="price">
                                                    <span className="currency font-['Lato'] text-[60px] font-light text-[#414141] leading-[60px] tracking-[-2px]">
                                                        {pkg.price?.toLocaleString()}
                                                    </span>
                                                    <span className="sign font-['Lato'] text-2xl font-normal text-[#414141] align-middle ml-2">
                                                        VND
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feature List */}
                                        <div className="generic_feature_list mb-5">
                                            <ul className="list-none p-0 m-0">
                                                <li className="font-['Lato'] text-lg py-4 px-0 text-[#a7a7a7] transition-all duration-300 hover:bg-[#E4E4E4] hover:border-l-[5px] hover:border-[#2ECC71]">
                                                    <span className="text-[#414141]">Describe: </span>
                                                    {pkg.description}
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Price Button */}
                                        <div className="generic_price_btn clearfix">
                                            {currentPackage && currentPackage.packageId === pkg.packageId ? (
                                                <button
                                                    className="inline-block font-['Lato'] text-lg px-8 py-3 rounded-full border border-[#ccc] bg-[#FF6D00] text-white cursor-not-allowed"
                                                    disabled
                                                >
                                                    Package In Use
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpgradeClick(pkg)}
                                                    className="inline-block font-['Lato'] text-lg px-8 py-3 rounded-full border border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71] hover:text-white transition-all duration-300"
                                                >
                                                    Upgrade
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {showPaymentModal && <PaymentModal />}
            </div>
        </>
    );
};

export default PackageList;
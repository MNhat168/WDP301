import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const ChangePassword = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        currentpass: '',
        newpass: '',
        confirmnewpass: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch('http://localhost:8080/changepass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while changing password');
        }
    };

    return (
        <>
            {BanPopup}
            <Header />
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 z-50 relative">
                        <div className="flex items-center justify-center mb-4">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-center mb-2">Success!</h3>
                        <p className="text-gray-600 text-center">Password changed successfully. Please login again.</p>
                    </div>
                </div>
            )}

            <div className="container mt-32">
                <div className="flex justify-center">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold">Change Password</h2>
                                <p className="text-gray-600">Update your password in this platform.</p>
                            </div>

                            {error && (
                                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentpass"
                                        value={formData.currentpass}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newpass"
                                        value={formData.newpass}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmnewpass"
                                        value={formData.confirmnewpass}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
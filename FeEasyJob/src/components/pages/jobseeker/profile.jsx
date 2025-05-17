import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
// import toastr from 'toastr';
// import 'toastr/build/toastr.min.css';
import useBanCheck from '../admin/checkban';

const Profile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        phoneNumber: '',
        dateOfBirth: ''
    });
    const [message, setMessage] = useState('');

    const API_BASE_URL = 'http://localhost:8080'

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate('/login');
            return;
        }
        setIsLoggedIn(true);
        fetchProfile();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const fetchProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(`${API_BASE_URL}/viewprofilejb`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile({
                    ...data,
                    dateOfBirth: formatDate(data.dateOfBirth)
                });
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const formattedProfile = {
                ...profile,
                dateOfBirth: formatDate(profile.dateOfBirth)
            };

            const response = await fetch(`${API_BASE_URL}/updateprofilejb`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                credentials: 'include',
                body: JSON.stringify(formattedProfile)
            });

            if (response.ok) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
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
                            <svg
                                className="w-16 h-16 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-center mb-2">Success!</h3>
                        <p className="text-gray-600 text-center">Your profile has been updated successfully.</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <div className="container mt-32">
                <div className="flex justify-center">
                    <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex gap-8">
                                <div className="flex-1">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-semibold">Personal Information</h2>
                                        <p className="text-gray-600">View and edit your personal information</p>
                                    </div>

                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={profile.firstName}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={profile.lastName}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-semibold">Account Settings</h2>
                                        <p className="text-gray-600">Update your account settings</p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">City/Province</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={profile.city}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={profile.phoneNumber}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            pattern="\d+"
                                            title="Please enter a valid phone number (digits only)"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={profile.dateOfBirth || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center mt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Save
                                </button>
                            </div>

                            {message && (
                                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const CVProfile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cvProfile, setCvProfile] = useState({
        skills: '',
        experience: '',
        description: '',
        education: '',
        certifications: '',
        linkUrl: '',
        number: '',
        avatar: null,
        linkPdf: null
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPdf, setShowPdf] = useState(false);

    const API_BASE_URL = 'http://localhost:8080';

    const getFileUrl = (path) => {
        if (!path) return null;
        return `${API_BASE_URL}${path}`;
    };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate('/login');
            return;
        }
        setIsLoggedIn(true);
        fetchCVProfile();
    }, [navigate]);

    const fetchCVProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/viewcvprofile`, {
                credentials: 'include',  // Important for sending cookies
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCvProfile(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load CV profile');
                if (response.status === 401) {
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Error fetching CV profile:', error);
            setError('Failed to load CV profile');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            // Add text fields
            formData.append('skills', cvProfile.skills || '');
            formData.append('experience', cvProfile.experience || '');
            formData.append('description', cvProfile.description || '');
            formData.append('education', cvProfile.education || '');
            formData.append('certifications', cvProfile.certifications || '');
            formData.append('linkUrl', cvProfile.linkUrl || '');
            formData.append('number', cvProfile.number || '0');

            // Add files if they exist
            if (cvProfile.avatarFile) {
                formData.append('avatarFile', cvProfile.avatarFile);
            }
            if (cvProfile.pdfFile) {
                formData.append('pdfFile', cvProfile.pdfFile);
            }

            // Log the form data for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await fetch(`${API_BASE_URL}/updatecvprofile`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const result = await response.json();
            console.log('Success response:', result);
            setMessage('Profile updated successfully!');

            // Update the CV profile with the returned data
            if (result.profile) {
                setCvProfile(prev => ({
                    ...prev,
                    ...result.profile,
                    // Clear file objects after successful upload
                    avatarFile: null,
                    pdfFile: null
                }));
            }

            setError('');

            // Refresh the profile data
            await fetchCVProfile();

        } catch (err) {
            console.error('Error:', err);
            setError('Error updating profile: ' + (err.message || 'Unknown error occurred'));
        }
    };

    // Update handleInputChange to handle files correctly
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                setCvProfile(prev => ({
                    ...prev,
                    [name]: file,
                    // Create a temporary URL for preview
                    [name === 'avatarFile' ? 'avatar' : 'linkPdf']: URL.createObjectURL(file)
                }));
            }
        } else {
            setCvProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    return (
        <>
            {BanPopup}
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
                            <h2 className="text-2xl font-bold text-white">Professional CV Profile</h2>
                            <p className="mt-1 text-blue-100">Manage your professional information and documents</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Profile Information */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Professional Information
                                        </h3>

                                        {/* Skills Input */}
                                        <div className="mb-4">
                                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                                                Skills
                                            </label>
                                            <input
                                                type="text"
                                                id="skills"
                                                name="skills"
                                                value={cvProfile.skills}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., JavaScript, React, Node.js"
                                                required
                                            />
                                        </div>

                                        {/* Experience Input */}
                                        <div className="mb-4">
                                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                                                Experience
                                            </label>
                                            <textarea
                                                id="experience"
                                                name="experience"
                                                value={cvProfile.experience}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Describe your work experience"
                                                required
                                            />
                                        </div>

                                        {/* Description Input */}
                                        <div className="mb-4">
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                Professional Summary
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={cvProfile.description}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Brief professional summary"
                                                required
                                            />
                                        </div>

                                        {/* Education Input */}
                                        <div className="mb-4">
                                            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                                                Education
                                            </label>
                                            <textarea
                                                id="education"
                                                name="education"
                                                value={cvProfile.education}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your educational background"
                                                required
                                            />
                                        </div>

                                        {/* Certifications Input */}
                                        <div className="mb-4">
                                            <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                                                Certifications
                                            </label>
                                            <input
                                                type="text"
                                                id="certifications"
                                                name="certifications"
                                                value={cvProfile.certifications}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., AWS Certified, PMP"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Media Upload */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Profile Media
                                        </h3>

                                        {/* Avatar Upload */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Picture
                                            </label>
                                            <div className="mt-1 flex items-center space-x-4">
                                                {cvProfile.avatar && (
                                                    <img
                                                        src={getFileUrl(cvProfile.avatar)}
                                                        alt="Profile"
                                                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                                                        onError={(e) => {
                                                            console.error('Error loading image:', e);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        name="avatarFile"
                                                        onChange={handleInputChange}
                                                        accept="image/*"
                                                        className="block w-full text-sm text-gray-500
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-full file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-blue-50 file:text-blue-700
                                                            hover:file:bg-blue-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* PDF Upload */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CV Document
                                            </label>
                                            <div className="mt-1 space-y-2">
                                                <input
                                                    type="file"
                                                    name="pdfFile"
                                                    onChange={handleInputChange}
                                                    accept="application/pdf"
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100"
                                                />
                                                {cvProfile.linkPdf && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPdf(!showPdf)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            {showPdf ? 'Close Preview' : 'Preview CV'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Profile
                                </button>
                            </div>

                            {/* Messages */}
                            {message && (
                                <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
                                    <p className="text-green-700">{message}</p>
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                {showPdf && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowPdf(false)}></div>
                            </div>

                            {/* Modal panel */}
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-lg w-full relative">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowPdf(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* PDF Download Option */}
                                <div className="bg-white p-8 text-center">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">View CV Document</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Click below to open the CV in a new tab or download it
                                    </p>
                                    <div className="flex justify-center space-x-4">
                                        <a
                                            href={getFileUrl(cvProfile.linkPdf)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Open in New Tab
                                        </a>
                                        <a
                                            href={getFileUrl(cvProfile.linkPdf)}
                                            download
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CVProfile;
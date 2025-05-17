import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OTPVerificationModal from "../../layout/otpchecker";
import companyImage from '../../../assets/company.png';
const RegisterEmployer = () => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('firstname', formData.firstname);
            formDataToSend.append('lastname', formData.lastname);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);

            const response = await axios.post(
                "http://localhost:8080/register-employer",
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
            );

            if (response.data) {
                setShowOtpModal(true);
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="flex justify-center items-center w-full h-screen bg-gradient-to-r from-[rgba(128,0,128,0.7)] via-[rgba(75,0,130,0.7)] to-[rgba(255,105,180,0.7)]"
        >
            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-[400px] relative shadow-md">
                        <button
                            onClick={() => setShowOtpModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Enter OTP
                        </h2>
                        <p className="text-gray-600 text-center mb-8">
                            We have sent a verification code to your email
                        </p>
                        <OTPVerificationModal
                            onSuccess={() => {
                                setShowOtpModal(false);
                                navigate('/loginemployeer?success=true');
                            }}
                            onClose={() => setShowOtpModal(false)}
                            isEmployer={true}
                        />
                    </div>
                </div>
            )}
    
            <div className="flex w-[1000px] h-[700px] bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Left Side */}
                <div className="w-2/5 bg-gradient-to-b from-[rgba(219,112,255,0.7)] via-[rgba(75,0,130,0.7)] to-[rgba(255,105,180,0.7)] p-8 flex flex-col justify-center items-center relative">
                  
                    <div className="relative w-[314px] h-[72px]">
                        <p className="absolute top-10 left-1/2 transform -translate-x-1/2 text-shadow-[0px_3px_3px_#00000040] font-bold text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                            Create Employer<br />Account
                        </p>
                    </div>
                    <div className="w-[400px] h-[500px] relative">
                        <img
                            className="absolute w-[400px] h-[422px] top-28 left-8 object-cover"
                            alt="Main image"
                            src={companyImage}
                        />
                    </div>
                </div>
    
                {/* Right Side - Form */}
                <div className="w-3/5 flex justify-center items-center bg-white">
                    <div className="w-[80%] bg-white rounded-2xl p-10 shadow-md">
                        <div className="flex flex-col items-center">
                            <img
                                className="w-13 h-13 mb-4"
                                src="/images/easyjobwithouttext.png"
                                alt="Logo"
                            />
                            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                                Employer Sign up
                            </h2>
                        </div>
    
                        <div className="space-y-6">
                            {/* First Name */}
                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        name="firstname"
                                        className="p-3 pt-5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        placeholder=" "
                                    />
                                    <label className="absolute top-3 left-3 text-gray-600 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none">
                                        First Name
                                    </label>
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        name="lastname"
                                        className="p-3 pt-5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        placeholder=" "
                                    />
                                    <label className="absolute top-3 left-3 text-gray-600 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none">
                                        Last Name
                                    </label>
                                </div>
                            </div>
    
                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    className="p-3 pt-5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder=" "
                                />
                                <label className="absolute top-3 left-3 text-gray-600 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none">
                                    Email
                                </label>
                            </div>
    
                            {/* Password */}
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    className="p-3 pt-5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder=" "
                                />
                                <label className="absolute top-3 left-3 text-gray-600 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none">
                                    Password
                                </label>
                            </div>
                        </div>
    
                        {/* Register Button */}
                        <button
                            className="w-full mt-8 p-3 bg-purple-400 text-white font-medium rounded-md shadow-md hover:bg-purple-500 transition duration-300"
                            onClick={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin h-5 w-5 mr-3"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : null}
                            {isLoading ? "Registering..." : "Register as Employer"}
                        </button>
    
                        {error && (
                            <p className="text-red-500 text-sm mt-2 text-center">
                                {error}
                            </p>
                        )}
    
                        <p className="text-center text-gray-600 text-sm mt-6">
                            Already have an account?{" "}
                            <a
                                href="/loginemployeer"
                                className="text-purple-500 hover:text-purple-600 underline"
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterEmployer;
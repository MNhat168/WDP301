import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import companyImage from '../../../assets/company.png';
const LoginEmp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/login", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
  
      const user = response.data;
  
      // Check if user is banned
      if (user.status === 'banned') {
        setError("Your account has been banned. Please contact support for assistance.");
        setIsLoading(false);
        return;
      }
  
      localStorage.setItem("user", JSON.stringify(user));
      const roleId = user.role.roleId;
      if (roleId === 2) { 
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/homeemp");
      } else if (user.role && user.role.roleId === 1) {
        navigate("/admin/home");
      } else {
        setError("Invalid account type. Please use the correct login page.");
      }
      
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.status === 403 
        ? "Your account has been banned. Please contact support for assistance."
        : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
        className="flex justify-center items-center w-full h-screen bg-gradient-to-r from-[rgba(128,0,128,0.7)] via-[rgba(75,0,130,0.7)] to-[rgba(255,105,180,0.7)]"
    >
        <div className="flex w-[1000px] h-[700px] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Left Section - Gradient Background */}
            <div className="w-2/5 bg-gradient-to-b from-[rgba(219,112,255,0.7)] via-[rgba(75,0,130,0.7)] to-[rgba(255,105,180,0.7)] p-8 flex flex-col justify-center items-center relative">
               
                <div className="relative w-[314px] h-[72px]">
                    <p className="absolute top-10 left-1/2 transform -translate-x-1/2 text-shadow-[0px_3px_3px_#00000040] font-bold text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                        Sign in to Get <br /> Started
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

            {/* Right Section - Form Container */}
            <div className="w-3/5 flex justify-center items-center bg-white">
                <div className="w-[80%] bg-white rounded-2xl p-10 shadow-md">
                    <h2 className="text-3xl font-semibold text-black text-center mb-8">Sign in</h2>
                    <div className="space-y-6">
                        {/* Email Input */}
                        <div className="relative">
                            <input
                                type="email"
                                className="p-3 pt-5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder=" "
                            />
                            <label className="absolute top-3 left-3 text-gray-600 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none">
                                Email
                            </label>
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type="password"
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

                    <button
                        className="w-full mt-8 p-3 bg-purple-400 text-white font-medium rounded-md shadow-md hover:bg-purple-500 transition duration-300 flex items-center justify-center"
                        onClick={handleLogin}
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
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm mt-2 text-center">
                            {error}
                        </p>
                    )}

                    <p className="text-center text-gray-600 text-sm mt-6">
                        You don't have an account?{" "}
                        <a
                            href="/registeremp"
                            className="text-purple-500 hover:text-purple-600 underline"
                        >
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
);
}

export default LoginEmp;
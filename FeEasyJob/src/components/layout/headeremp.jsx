import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatBox from './chatbox';


const HeaderEmployer = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    if (user) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/notification/employer-notifications",
        { withCredentials: true }
      );

      // Retrieve existing read status from local storage
      const existingReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus")) || {};

      // Update notifications with read status from local storage
      const updatedNotifications = response.data.map((notif) => ({
        ...notif,
        read: existingReadStatus[notif.id] || false, // Use stored read status
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);

    // Update local storage with the new read status
    const readStatus = {};
    updatedNotifications.forEach((notif) => {
      readStatus[notif.id] = true; // Mark all as read
    });
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllAsRead(); // Mark all as read when opening
    }
  };

  return (
   
    <header className="bg-gray-100 shadow-md sticky top-0 z-50 border-b-2 border-gray-200">
     
              
         
      <nav className="flex items-center justify-between h-20 px-6 sm:px-12">
        {/* Logo and Branding */}
        <Link to="/homeemp" className="flex items-center space-x-3">
          <img
            src="/images/easyjobb.png"
            alt="EasyJob"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="text-2xl font-bold text-indigo-700 tracking-tight">EasyJob</span>
        </Link>

        {/* Main Navigation Links */}
        <ul className="hidden sm:flex items-center space-x-8">
          <li>
            <Link
              to="/create-or-update-company-profile"
              className="text-gray-800 hover:text-indigo-700 font-semibold transition-colors duration-300"
            >
              <span className="flex items-center space-x-2">
                <i className="fas fa-building"></i>
                <span>Company</span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/create-job"
              className="text-gray-800 hover:text-indigo-700 font-semibold transition-colors duration-300"
            >
              <span className="flex items-center space-x-2">
                <i className="fas fa-pencil-alt"></i>
                <span>Post a Job</span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/jobslist"
              className="text-gray-800 hover:text-indigo-700 font-semibold transition-colors duration-300"
            >
              <span className="flex items-center space-x-2">
                <i className="fas fa-briefcase"></i>
                <span>Created Jobs</span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/employer/blogs"
              className="text-gray-800 hover:text-indigo-700 font-semibold transition-colors duration-300"
            >
              <span className="flex items-center space-x-2">
                <i className="fas fa-blog"></i>
                <span>Blogs</span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/listApplyCv"
              className="text-gray-800 hover:text-indigo-700 font-semibold transition-colors duration-300"
            >
              <span className="flex items-center space-x-2">
                <i className="fas fa-file-alt"></i>
                <span>CVs</span>
              </span>
            </Link>
          </li>
        </ul>

        {/* Right Section (Icons & Profile) */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-all duration-200"
            >
              {notifications.filter((notif) => !notif.read).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter((notif) => !notif.read).length}
                </span>
              )}
              <i className="fas fa-bell text-gray-600 text-xl"></i>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="p-4">
                  {notifications.length === 0 ? (
                    <p className="text-gray-600">No new notifications.</p>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={notif.id}
                        className={`p-2 rounded-md ${notif.read ? "bg-gray-100" : "bg-indigo-100"}`}
                      >
                        <p className="text-sm text-gray-700">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <Link
            to="/messageListAccount"
            className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-all duration-200"
          >
            <i className="fas fa-envelope text-gray-600 text-xl"></i>
          </Link>

          {/* Account Menu */}
          <div className="relative group">
            <button className="flex items-center justify-center p-2 rounded-full hover:bg-indigo-100 transition-all duration-200">
              <div className="w-6 h-6 flex flex-col justify-between space-y-1">
                <span className="w-full h-[2px] bg-gray-600"></span>
                <span className="w-full h-[2px] bg-gray-600"></span>
                <span className="w-full h-[2px] bg-gray-600"></span>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible transition-all duration-200">
              <div className="py-2">
                <Link
                  to="/viewprofilejb"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 transition"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/changepass"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 transition"
                >
                  Change Password
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
                <ChatBox/>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
};

export default HeaderEmployer;
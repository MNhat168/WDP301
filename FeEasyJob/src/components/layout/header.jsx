import { useState, useRef, useEffect } from 'react';
import { Link,  useNavigate } from 'react-router-dom';

import axios from 'axios';
import ChatBox from './chatbox';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const menuRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    if (user) {
      fetchNotifications();
    }
  }, []);

  //   useEffect(() => {
  //     const handleClickOutside = (event) => {
  //       if (menuRef.current && !menuRef.current.contains(event.target)) {
  //         setIsMenuOpen(false);
  //       }
  //       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //         setIsDropdownOpen(false);
  //       }
  //     };

  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  //   }, []);
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/notification/jobseeker-notifications",
        { withCredentials: true }
      );

      const existingReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus")) || {};
      const updatedNotifications = response.data.map((notif) => ({
        ...notif,
        read: existingReadStatus[notif.id] || false,
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);

    const readStatus = {};
    updatedNotifications.forEach((notif) => {
      readStatus[notif.id] = true;
    });
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllAsRead();
    }
  };

  // Fetch notifications from the server
  //   useEffect(() => {
  //     const fetchNotis = async () => {
  //         try {
  //             const response = await axios.get('http://localhost:8080/notification/jobseeker-notifications', {
  //                 withCredentials: true,
  //             });
  //             const data = response.data;
  //             setNotifications(data)
  //         } catch (error) {
  //             console.error('Error fetching job details:', error);
  //         }
  //     };
  //     fetchNotis();
  // }, [])

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <nav className="container mx-auto px-6 flex items-center justify-between">
                {/* Code hiện tại */}
                <ChatBox />
            </nav>
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={isLoggedIn ? "/home" : "/"}
          className="flex items-center space-x-2"
        >
          <img src="/images/easyjobwithouttext.png" alt="Logo" className="h-10 w-10" />
          <span className="text-lg font-bold tracking-wide">JobFinder</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to={isLoggedIn ? "/home" : "/"} className="text-sm font-medium hover:text-gray-300">Home</Link>
          <Link to="/jobsearch" className="text-sm font-medium hover:text-gray-300">Jobs</Link>
          <Link to="/about-us" className="text-sm font-medium hover:text-gray-300">About Us</Link>
          <Link to="/blogs" className="text-sm font-medium hover:text-gray-300">Blog</Link>
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-sm font-medium hover:text-gray-300 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              More
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg py-2 z-50">
                <Link
                  to="/team"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Team
                </Link>
                <Link
                  to="/companies"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Enterprise
                </Link>
                <Link
                  to="/terms"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Terms
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      to="/cvprofile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      CV Profile
                    </Link>
                    <Link
                      to="/favorite-jobs"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Saved Jobs
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm rounded-md"
              >
                Find A Job
              </Link>
              <Link
                to="/loginemployeer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-md"
              >
                Post A Job
              </Link>
            </>
          )}
          {isLoggedIn && (
            <div ref={menuRef} className="relative">
              <button
                onClick={toggleNotifications}
                className="space-x-4 p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-all duration-200"
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
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-16 6h16"
                  ></path>
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b">
                    ACTIONS
                  </div>

                  <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </Link>

                  <Link to="/changepass" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </Link>

                  <Link to="/cvgenerate" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Create CV
                  </Link>

                  <Link to="/packages" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Upgrade Package
                  </Link>

                  <Link to="/application" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    CVs submitted
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
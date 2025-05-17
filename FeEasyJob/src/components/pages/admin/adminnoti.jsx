import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';

const AdminNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [newNotificationsCount, setNewNotificationsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:8080/notification', {
                    withCredentials: true
                });

                const fetchedNotifications = response.data;
                setNotifications(fetchedNotifications);

                // Count new/unread notifications
                const newCount = fetchedNotifications.filter(
                    notification => !notification.isRead
                ).length;

                setNewNotificationsCount(newCount);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError('Failed to fetch notifications');
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [navigate]);

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="py-6 px-8 bg-white shadow-sm border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Notifications</h1>
                        <p className="text-sm text-gray-600 mt-1">View all notifications sent to admins</p>
                    </div>

                    {/* Notification Badge */}
                    <div className="relative">
                        <button className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            {newNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {newNotificationsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="p-8">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
                                    <p className="mt-1 text-sm text-gray-500">No notifications match your current filters.</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div key={notification.notificationId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                        <div className="p-6">
                                            <h3 className="text-lg font-medium text-gray-900">{notification.message}</h3>
                                            <p className="text-sm text-gray-500">{new Date(notification.time).toLocaleString()}</p>
                                            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${notification.type === 'report' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                                                {notification.type ? notification.type.charAt(0).toUpperCase() + notification.type.slice(1) : 'Unknown Type'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminNotifications;

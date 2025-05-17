import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../layout/adminsidebar';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [activeTab]); // Fetch users when the activeTab changes

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            let endpoint = '/admin/users';
            if (activeTab === 'jobseekers') {
                endpoint = '/admin/users/jobseekers';
            } else if (activeTab === 'employers') {
                endpoint = '/admin/users/employers';
            }

            const response = await axios.get(`http://localhost:8080${endpoint}`, {
                withCredentials: true,
            });
            setUsers(response.data);
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8080/admin/users/stats', {
                withCredentials: true,
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleToggleBan = async (userId) => {
        if (!userId) {
            console.error('User ID is undefined:', userId);
            setError('Invalid user ID');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/admin/users/${userId}/toggle-ban`,
                {},
                {
                    withCredentials: true,
                }
            );
            console.log('Toggle ban response:', response.data);
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error toggling ban status:', error);
            setError('Failed to update user status');
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="py-6 px-8 bg-white shadow-sm border-b">
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage all users and their access</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm">Total Users</h3>
                        <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm">Job Seekers</h3>
                        <p className="text-2xl font-bold">{stats.totalJobSeekers || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm">Employers</h3>
                        <p className="text-2xl font-bold">{stats.totalEmployers || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm">Banned Users</h3>
                        <p className="text-2xl font-bold">{stats.bannedUsers || 0}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['all', 'jobseekers', 'employers'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-8">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name"
                        className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Users Table */}
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
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.userId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="p-6">
                                        {/* User Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {/* User Avatar */}
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-xl font-medium text-gray-600">
                                                        {`${user.firstName?.[0]}${user.lastName?.[0]}`}
                                                    </span>
                                                </div>
                                                {/* User Info */}
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {`${user.firstName} ${user.lastName}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            {/* Status Badge */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${user.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.status || 'N/A'}
                                            </span>
                                        </div>
                                        {/* Action Button */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => handleToggleBan(user.userId)}
                                                className={`w-full px-4 py-2 rounded-md font-medium transition-colors duration-200
                                    ${user.status === 'active'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {user.status === 'active' ? 'Ban User' : 'Unban User'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserManagement;

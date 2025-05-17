import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate, Link } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    activeAccounts: 0,
    lockedAccounts: 0,
    topJobs: [],
    jobStatistics: [],
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/current', {
          withCredentials: true
        });
        if (!response.data || response.data.role?.roleId !== 1) {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    // const fetchData = async () => {
    //   try {
    //     // Add your API endpoints here
    //     const [statsResponse, topJobsResponse, statisticsResponse] = await Promise.all([
    //       axios.get('http://localhost:8080/admin/stats', { withCredentials: true }),
    //       axios.get('http://localhost:8080/admin/top-jobs', { withCredentials: true }),
    //       axios.get('http://localhost:8080/admin/job-statistics', { withCredentials: true })
    //     ]);

    //     setStats({
    //       ...statsResponse.data,
    //       topJobs: topJobsResponse.data,
    //       jobStatistics: statisticsResponse.data
    //     });
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };

    checkAuth();
    // fetchData();
  }, [navigate]);

  return (
    <div className="flex">
      <div className="dash-nav dash-nav-dark bg-gray-900 w-64 min-h-screen fixed">
        <header className="flex items-center justify-center p-4 border-b border-gray-700">
            <Link to="/admin/home" className="text-white text-xl font-bold">
                Admin Dashboard
            </Link>
        </header>

        <nav className="mt-4">
            <ul className="space-y-2">
                <li>
                    <Link
                        to="/admin/home"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-home mr-3"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/users"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-users mr-3"></i>
                        <span>Users Management</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/jobs"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-briefcase mr-3"></i>
                        <span>Jobs Management</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/companies"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-building mr-3"></i>
                        <span>Companies</span>
                    </Link>
                </li>
                {/* Package Management Section */}
                <li>
                    <div className="px-4 py-2 text-gray-400 text-sm uppercase">
                        Package Management
                    </div>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                to="/admin/packages"
                                className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                            >
                                <i className="fas fa-box mr-3"></i>
                                <span>All Packages</span>
                            </Link>
                        </li>
                        {/* <li>
                  <Link
                    to="/admin/packages/create"
                    className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  >
                    <i className="fas fa-plus-circle mr-3"></i>
                    <span>Create Package</span>
                  </Link>
                </li> */}
                        <li>
                            <Link
                                to="/admin/packages/transactions"
                                className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                            >
                                <i className="fas fa-receipt mr-3"></i>
                                <span>Transactions</span>
                            </Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <Link
                        to="/admin/notifications"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-chart-line mr-3"></i>
                        <span>Reports</span>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                    >
                        <i className="fas fa-cog mr-3"></i>
                        <span>Settings</span>
                    </Link>
                </li>
                {/* Logout Option */}
                <li className="mt-auto">
                    <button
                        onClick={() => {
                            // Add logout logic here
                            localStorage.removeItem('user');
                            navigate('/');
                        }}
                        className="flex items-center px-4 py-3 text-white hover:bg-gray-800 w-full"
                    >
                        <i className="fas fa-sign-out-alt mr-3"></i>
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        </nav>
    </div>
    </div>
  );
};

export default AdminSidebar;
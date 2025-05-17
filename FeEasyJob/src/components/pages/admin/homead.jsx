import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    activeAccounts: 0,
    bannedAccounts: 0,
    topJobs: [],
    monthlyStats: []
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

    const fetchData = async () => {
      try {
        const [statsResponse, monthlyResponse, topJobsResponse] = await Promise.all([
          axios.get('http://localhost:8080/admin/dashboard/stats', { 
            withCredentials: true 
          }),
          axios.get('http://localhost:8080/admin/dashboard/monthly-jobs', { 
            withCredentials: true 
          }),
          axios.get('http://localhost:8080/admin/dashboard/top-jobs', { 
            withCredentials: true 
          })
        ]);

        setStats({
          ...statsResponse.data,
          monthlyStats: monthlyResponse.data,
          topJobs: topJobsResponse.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    checkAuth();
    fetchData();
  }, [navigate]);

  // Bar Chart Data - using your Statistic model structure
  const barChartData = {
    labels: stats.monthlyStats.map(stat => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months[stat.month - 1];
    }),
    datasets: [{
      label: 'Jobs Posted',
      data: stats.monthlyStats.map(stat => stat.countJob),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  // Pie Chart Data
  const pieChartData = {
    labels: ['Active Accounts', 'Banned Accounts'],
    datasets: [{
      data: [stats.activeAccounts, stats.bannedAccounts],
      backgroundColor: ['#33FF57', '#FF5733'],
      borderColor: ['#2EE54E', '#FF4E2B'],
      borderWidth: 1
    }]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {/* Header section remains the same */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-bell"></i>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-user-circle"></i>
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Users</h3>
              <div className="flex items-center">
                <i className="fas fa-user text-blue-500 text-2xl mr-3"></i>
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Jobs</h3>
              <div className="flex items-center">
                <i className="fas fa-briefcase text-green-500 text-2xl mr-3"></i>
                <span className="text-2xl font-bold">{stats.totalJobs}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Companies</h3>
              <div className="flex items-center">
                <i className="fas fa-building text-red-500 text-2xl mr-3"></i>
                <span className="text-2xl font-bold">{stats.totalCompanies}</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Monthly Jobs Posted</h3>
              <Bar data={barChartData} options={chartOptions} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Account Status</h3>
              <Pie data={pieChartData} />
            </div>
          </div>

          {/* Top Jobs Table */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Top 5 Hot Jobs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Salary</th>
                    <th className="px-4 py-2">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topJobs.map((job, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2">{job.Title}</td>
                      <td className="px-4 py-2">{job.Location}</td>
                      <td className="px-4 py-2">{job.Salary}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="bg-blue-500 text-white rounded-full px-3 py-1">
                          {job.ApplyCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
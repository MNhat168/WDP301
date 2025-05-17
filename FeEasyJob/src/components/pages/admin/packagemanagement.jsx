import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';

const PackageManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        packageName: '',
        description: '',
        price: '',
        duration: '',
        features: ''
    });
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);  // Initialize as empty array
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:8080/packages', {
                withCredentials: true
            });

            console.log('Raw response:', response); // Debug log

            // Directly use the response data as it should be an array
            setPackages(response.data || []);

        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to load packages');
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const packageData = {
                ...formData,
                price: parseInt(formData.price),
                duration: parseInt(formData.duration)
            };

            if (editingPackage) {
                await axios.post(`http://localhost:8080/packages/update/${editingPackage.packageId}`,
                    packageData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                await axios.post('http://localhost:8080/packages',
                    packageData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            setIsModalOpen(false);
            setEditingPackage(null);
            setFormData({
                packageName: '',
                description: '',
                price: '',
                duration: '',
                features: ''
            });
            fetchPackages();
        } catch (error) {
            console.error('Error saving package:', error);
            setError(error.response?.data?.message || 'Error saving package');
        }
    };

    const handleDelete = async (packageId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await axios.delete(`http://localhost:8080/packages/delete/${packageId}`, {
                    withCredentials: true
                });
                fetchPackages();
            } catch (error) {
                console.error('Error deleting package:', error);
                setError('Failed to delete package');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            packageName: pkg.packageName,
            description: pkg.description,
            price: pkg.price,
            duration: pkg.duration,
            features: pkg.features
        });
        setIsModalOpen(true);
    };
    
    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="py-6 px-8 bg-white shadow-sm border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Package Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your subscription packages</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPackage(null);
                                setFormData({
                                    packageName: '',
                                    description: '',
                                    price: '',
                                    duration: '',
                                    features: ''
                                });
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Package
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        /* Package List */
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {packages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-lg">No packages found</p>
                                    <p className="text-sm mt-2">Create your first package to get started</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Package Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Duration
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {packages.map((pkg) => (
                                                <tr key={pkg.packageId} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{pkg.packageName}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-500 line-clamp-2">{pkg.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-green-600">${pkg.price}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {pkg.duration} days
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEdit(pkg)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(pkg.packageId)}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingPackage ? 'Edit Package' : 'Add New Package'}
                                    </h2>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                                            <input
                                                type="text"
                                                name="packageName"
                                                value={formData.packageName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                    
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows="3"
                                            required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Features</label>
                                        <textarea
                                            name="features"
                                            value={formData.features}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows="3" />
                                    </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {editingPackage ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
              </div>
            </div>
          )}
        </div >
      </div >
    </>
  );
};

export default PackageManagement;
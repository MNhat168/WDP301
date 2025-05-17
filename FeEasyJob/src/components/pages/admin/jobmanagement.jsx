import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../layout/adminsidebar';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/jobs', {
                    withCredentials: true,
                });
                setJobs(response.data);
                console.log("Jobs fetched:", response.data);
            } catch (err) {
                setError('Failed to fetch jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleAccept = async (jobId) => {
        try {
            await axios.post(`http://localhost:8080/admin/jobs/${jobId}/accept`, {}, {
                withCredentials: true,
            });
            alert("Job accepted and employer notified.");
            setJobs(jobs.map((job) => (job.jobId === jobId ? { ...job, status: 'Accepted' } : job)));
        } catch (err) {
            alert("Failed to accept job.");
        }
    };

    const handleReject = async (jobId) => {
        try {
            await axios.post(`http://localhost:8080/admin/jobs/${jobId}/reject`, {}, {
                withCredentials: true,
            });
            alert("Job rejected and employer notified.");
            setJobs(jobs.map((job) => (job.jobId === jobId ? { ...job, status: 'Rejected' } : job)));
        } catch (err) {
            alert("Failed to reject job.");
        }
    };

    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="py-6 px-8 bg-white shadow-sm border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Jobs</h1>
                    <p className="text-sm text-gray-600 mt-1">Review and manage job postings</p>
                </div>

                {/* Jobs Grid */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div
                                    key={job.jobId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="p-6">
                                        {/* Job Details */}
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                                        <p className="text-sm text-gray-700">{job.description}</p>

                                        {/* Status Badge */}
                                        <div className="mt-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                ${job.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : job.status === 'Accepted'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {job.status === 'Pending' && (
                                            <div className="mt-6 flex space-x-4">
                                                <button
                                                    onClick={() => handleAccept(job.jobId)}
                                                    className="flex-1 px-4 py-2 bg-green-50 text-green-600 font-medium rounded-md hover:bg-green-100 transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(job.jobId)}
                                                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
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

export default JobList;

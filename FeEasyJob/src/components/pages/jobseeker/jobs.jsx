import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from "../../layout/header";
import { useLocation } from 'react-router-dom';

const Jobs = () => {
    const [jobs, setJobs] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const location = useLocation();

    // Get companyId from the URL query string
    const companyId = new URLSearchParams(location.search).get('companyId');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/jobs', {
                    params: { companyId },
                });
                setJobs(response.data.jobs);
                setCompanyInfo(response.data.company); // Assuming the API sends company info as well
                setError(null);
            } catch (err) {
                setError('Error loading jobs.');
                setJobs(null);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [companyId]);

    return (
        <>
            <Header />
            <div className="bg-gray-100 min-h-screen">
                {/* Banner Section */}
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-center py-12">
                    <h4 className="text-lg font-semibold">Find Your Job Today!</h4>
                    <h2 className="text-4xl font-bold mt-2">Good Jobs Are Here</h2>
                </div>

                {/* Content Section */}
                <div className="container mx-auto py-8">
                    {/* Section Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Jobs List By Company</h2>
                    </div>

                    {/* Loading/Error State */}
                    {loading && <p className="text-center text-gray-600">Loading...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {/* Jobs List */}
                    {jobs && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <div
                                        key={job.jobId}
                                        className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition duration-300"
                                    >
                                        <h5 className="text-lg font-bold text-gray-800">{job.title}</h5>
                                        <p className="text-sm text-gray-600 mt-2">{job.description}</p>
                                        <p className="text-sm text-gray-600 mt-1">Salary: {job.salary}</p>
                                        <p className="text-sm text-gray-600 mt-1">Experience: {job.experienceYears} Years</p>
                                        <a
                                            href={`/jobs-detail?jobId=${job.jobId}`}
                                            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            View Detail
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 col-span-3">
                                    The company currently has no jobs.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Company Info */}
                    {companyInfo && (
                        <div className="mt-12 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="flex-shrink-0">
                                <img
                                    src={companyInfo.url} // assuming companyInfo contains a URL for the image
                                    alt="Company"
                                    className="w-full max-w-md rounded-lg shadow-lg"
                                />
                            </div>
                            <div>
                                <h5 className="text-lg font-bold text-gray-800">Company Name: {companyInfo.companyName}</h5>
                                <p className="text-gray-600 mt-2">
                                    <strong>Address:</strong> {companyInfo.address}
                                </p>
                                <p className="text-gray-600 mt-2">
                                    <strong>About Us:</strong> {companyInfo.aboutUs}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Jobs;

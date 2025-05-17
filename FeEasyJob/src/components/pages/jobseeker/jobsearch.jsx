import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const JobSearch = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        title: '',
        companyName: '',
        location: '',
        minSalary: '',
        minExperience: ''
    });

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fetchJobs = async (searchParams = '') => {
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const queryParams = new URLSearchParams(searchParams);
            queryParams.append("page", page);
            queryParams.append("size", size);
            const response = await fetch(`http://localhost:8080/search2?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.content);
                setTotalPages(data.totalPages);
            } else {
                console.error('Failed to fetch jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) queryParams.append(key, val);
        });
        fetchJobs(`?${queryParams.toString()}`);
    }, [page, size]);


    const debouncedFetch = debounce((searchParams) => {
        fetchJobs(searchParams);
    }, 500);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        const queryParams = new URLSearchParams();
        const updatedFilters = { ...filters, [name]: value };
        Object.entries(updatedFilters).forEach(([key, val]) => {
            if (val) queryParams.append(key, val);
        });

        queryParams.append("page", page);
        queryParams.append("size", size);
        debouncedFetch(`?${queryParams.toString()}`);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        fetchJobs(`?${queryParams.toString()}`);
    };

    return (
        <>
            {BanPopup}
            <Header />
            <div className="container mx-auto px-4 py-8 mt-20">
                <h1 className="text-3xl font-bold text-center mb-8">List of Jobs</h1>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side - Search and Filters */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <div className="space-y-6">
                                {/* Search Bar */}
                                <div className="search-wrap">
                                    <input
                                        type="search"
                                        name="title"
                                        value={filters.title}
                                        onChange={handleInputChange}
                                        placeholder="Search for jobs..."
                                        className="w-full p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Filter Section */}
                                <div className="space-y-4">
                                    {/* Company Filter */}
                                    <div className="filter-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={filters.companyName}
                                            onChange={handleInputChange}
                                            placeholder="Enter company name"
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Experience Filter */}
                                    <div className="filter-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            name="minExperience"
                                            value={filters.minExperience}
                                            onChange={handleInputChange}
                                            placeholder="Minimum years"
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Location Filter */}
                                    <div className="filter-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={filters.location}
                                            onChange={handleInputChange}
                                            placeholder="Enter location"
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Salary Filter */}
                                    <div className="filter-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Salary
                                        </label>
                                        <input
                                            type="number"
                                            name="minSalary"
                                            value={filters.minSalary}
                                            onChange={handleInputChange}
                                            placeholder="Enter amount"
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Job Listings */}
                    <div className="lg:w-3/4">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Job Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jobs.map((job, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                                >
                                    {/* Top section with job info */}
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4 line-clamp-2">
                                            {job.title}
                                        </h2>
                                        <div className="space-y-3">
                                            <img
                                                src={`http://localhost:8080${job.company.url}`}
                                                alt="Avatar"
                                                style={{ width: '100%' }}
                                            />
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Company:</span>
                                                <span className="line-clamp-1">{job.company.companyName}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Location:</span>
                                                <span className="line-clamp-1">{job.location}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Salary:</span>
                                                <span>${job.salary.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Experience:</span>
                                                <span>{job.experienceYears} years</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Start Date:</span>
                                                <span>
                                                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">End Date:</span>
                                                <span>
                                                    {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="font-medium w-24">Applicants:</span>
                                                <span>{job.applicantCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom section with buttons */}
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => navigate(`/jobs-detail?jobId=${job.jobId}`)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => {/* Add save job functionality */ }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Save Job
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-center items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                className={`px-4 py-2 rounded-md border ${page === 0
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage(index)}
                                    className={`px-4 py-2 rounded-md ${page === index
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                disabled={page + 1 === totalPages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className={`px-4 py-2 rounded-md border ${page + 1 === totalPages
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                Next
                            </button>
                        </div>


                        {/* No Results State */}
                        {!isLoading && jobs.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-500 text-lg">
                                    No jobs found matching your criteria
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

}

export default JobSearch;

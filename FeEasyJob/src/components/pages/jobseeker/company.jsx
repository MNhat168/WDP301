import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../layout/header';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true); // New state for loading

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get("http://localhost:8080/companies", {
                params: { keyword },
            });
            setCompanies(response.data);
            setLoading(false); // Set loading to false when data is fetched
        } catch (error) {
            console.error("Error fetching companies:", error);
            setLoading(false); // Also set loading to false if there's an error
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when new search is made
        fetchCompanies();
    };

    return (
        <>
            <Header />
            {/* Preloader: Only show when loading */}
            {loading && (
                <div id="preloader" className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="jumper">
                        <div />
                        <div />
                        <div />
                    </div>
                </div>
            )}

            {/* Company List Section */}
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-semibold text-gray-900">Company List</h2>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="max-w-md mx-auto flex space-x-3">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search companies..."
                            />
                            <button type="submit" className="px-4 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-300">
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Company Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <div key={company.companyId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <img
                                    src={`http://localhost:8080${company.url}`}
                                    className="w-full h-48 object-cover"
                                    alt={company.companyName}
                                />
                                <div className="p-6">
                                    <h5 className="text-xl font-semibold text-gray-900">{company.companyName}</h5>
                                    <h6 className="text-sm text-gray-500 mb-4">{company.address}</h6>
                                    <a
                                        href={`/jobs?companyId=${company.companyId}`}
                                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-300"
                                    >
                                        View List Jobs
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Companies;

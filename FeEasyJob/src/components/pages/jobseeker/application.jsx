import React, { useState, useEffect } from 'react';
import Header from '../../layout/header';

const Application = () => {
  const [applications, setApplications] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/application?keyword=${keyword}`, {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setApplications(data))
      .catch(error => {
        console.error("Error fetching applications:", error);
        setError("Could not fetch applications. Please try again.");
      });
  }, [keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(e.target.keyword.value);
  };

  return (
    <>
    <Header />
    <div className="bg-gray-100 min-h-screen">

      {/* Banner Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="banner owl-carousel">
          <div className="banner-item-01 relative text-center text-white py-24">
            <h4 className="text-lg font-semibold">Find your job today!</h4>
            <h2 className="text-4xl font-extrabold">Good jobs are here</h2>
          </div>
        </div>
      </div>

      {/* Job Search Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Job Applied</h2>
          </div>

          <form onSubmit={handleSearch} className="flex justify-center mb-8">
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                className="form-input w-full py-2 px-4 rounded-lg shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
                name="keyword"
                placeholder="Title job, Company Name"
              />
              <button
                className="ml-4 py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-danger bg-red-100 text-red-600 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Applications Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {applications.map((application) => (
              <div key={application.applicationId} className="card max-w-sm mx-auto bg-white shadow-lg rounded-lg">
                <div className="card-body p-6">
                  <h5 className="text-xl font-semibold text-gray-800">{application.job.title}</h5>
                  <span className="block text-gray-500">{application.companyName}</span>
                  <p className="mt-2 text-gray-600">Ngày Apply: {new Date(application.applicationDate).toLocaleDateString()}</p>
                  <a
                    href={`/jobs-detail?jobId=${application.job.jobId}`}
                    className="mt-4 inline-block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Detail Job
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
    </>
  );
};

export default Application;

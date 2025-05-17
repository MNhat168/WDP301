import React, { useEffect, useState } from "react";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from '../admin/checkban';

const ListJobCreate = () => {
  const [jobList, setJobList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accept');
  const BanPopup = useBanCheck();

  useEffect(() => {
    fetch("http://localhost:8080/jobslist", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched job list:", data); // Log the fetched job list
        setJobList(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching job list:", error);
        setIsLoading(false);
      });
  }, []);

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Do you really want to delete this job?")) {
      fetch(`http://localhost:8080/delete-job/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            setJobList((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId));
            toastr.success("Delete Job Is Successfully!", "Easyjob Notice", {
              timeOut: 2000,
            });
          } else {
            console.error("Failed to delete job");
          }
        })
        .catch((error) => {
          console.error("Error deleting job:", error);
        });
    }
  };

  const formatDate = (dateArray) => {
    try {
      if (!dateArray || !Array.isArray(dateArray)) {
        return "No date available";
      }

      const [year, month, day, hours, minutes] = dateArray;

      const date = new Date(year, month - 1, day, hours || 0, minutes || 0);

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter jobs based on their status
  const acceptedJobs = jobList.filter(job => job.status === 'Accept' && job.state !== 'Frozen');
  const rejectedJobs = jobList.filter(job => job.status === 'Reject');
  const pendingJobs = jobList.filter(job => job.status === 'Pending');
  const frozenJobs = jobList.filter(job => job.state === 'Frozen'); // Filter frozen jobs

  return (
    <>
      {BanPopup}
      <div className="min-h-screen bg-gray-50">
        <HeaderEmployer />

        {jobList.length === 0 ? (
          <div className="container mx-auto px-4 mt-20">
            <div className="text-center py-16 bg-white rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold mb-6">No Job has been created!</h1>
              <a
                href="/createjob"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Create your First Job!
              </a>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Job Post Tabs</h2>

              {/* Tab Navigation */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('accept')}
                  className={`px-6 py-2 rounded-full ${
                    activeTab === 'accept'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Job Accept
                </button>
                <button
                  onClick={() => setActiveTab('reject')}
                  className={`px-6 py-2 rounded-full ${
                    activeTab === 'reject'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Job Reject
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-2 rounded-full ${
                    activeTab === 'pending'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Job Pending
                </button>
                <button
                  onClick={() => setActiveTab('frozen')}
                  className={`px-6 py-2 rounded-full ${
                    activeTab === 'frozen'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Job Frozen
                </button>
              </div>

              {/* Job Cards Container */}
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {(activeTab === 'accept' ? acceptedJobs :
                    activeTab === 'reject' ? rejectedJobs :
                    activeTab === 'pending' ? pendingJobs :
                    frozenJobs).map((job) => {
                      console.log("Job properties:", job); // Log each job's properties
                      return (
                        <div
                          key={job.jobId}
                          className="flex-none w-72 bg-white rounded-lg shadow-md p-6 relative"
                        >
                          <div className="w-16 h-16 bg-blue-900 rounded-xl mb-4">
                            {/* SVG icon here */}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {job.category?.categoryName}
                          </h3>
                          <div className="text-gray-600 mb-2">Title: {job.title}</div>
                          <div className="text-gray-600 mb-2">
                            Company: {job.company?.companyName || "No company available"}
                          </div>
                          <div className="text-blue-600 italic mb-4">
                            Date: {formatDate(job.date)}
                          </div>
                          <a
                            href={`/jobdetails/${job.jobId}`}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            More Details
                          </a>
                          {job.state === "Frozen" ? (
                            <span className="absolute top-4 right-4 text-red-500">
                              Status: Frozen
                            </span>
                          ) : (
                            <span className="absolute top-4 right-4 text-green-500">
                              Status: {job.status}
                            </span>
                          )}
                          {job.state !== "Frozen" && (
                            <button
                              onClick={() => handleDeleteJob(job.jobId)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-window-close text-xl" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  
                  {((activeTab === 'accept' && acceptedJobs.length === 0) ||
                    (activeTab === 'reject' && rejectedJobs.length === 0) ||
                    (activeTab === 'pending' && pendingJobs.length === 0) ||
                    (activeTab === 'frozen' && frozenJobs.length === 0)) && (
                    <div className="text-center w-full py-8">
                      <h3 className={`text-xl ${
                        activeTab === 'accept' ? 'text-green-500' :
                        activeTab === 'reject' ? 'text-red-500' :
                        activeTab === 'pending' ? 'text-gray-500' :
                        'text-blue-500'
                      }`}>
                        There are no {activeTab} jobs
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListJobCreate;
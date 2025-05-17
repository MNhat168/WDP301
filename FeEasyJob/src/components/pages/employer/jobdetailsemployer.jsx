import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toastr from "toastr"; // Import toastr nếu bạn cần dùng
import HeaderEmployer from "../../layout/headeremp";

const JobDetailsEmployer = () => {
  const { id } = useParams();
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/jobdetails/${id}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setJobDetails(data);
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
      });
  }, [id]);

  if (!jobDetails) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-white text-black">
      <HeaderEmployer />
      <div
        className="relative bg-cover bg-center text-white py-16 animate-fade-in"
        style={{
          backgroundImage: "url(assets/images/heading-6-1920x500.jpg)",
        }}
      >
        <div className="container mx-auto text-center">
          <h4 className="text-xl uppercase tracking-wide text-purple-500">
            {jobDetails.category.categoryName} Jobs
          </h4>
          <h2 className="text-4xl font-bold text-purple-600">
            {jobDetails.title}
          </h2>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 lg:px-8">
        <div className="bg-gray-50 rounded-lg shadow-xl p-6 grid lg:grid-cols-4 gap-6 transition-all hover:shadow-2xl">
          <div className="lg:col-span-3">
            <p className="flex items-center space-x-2 text-gray-600">
              <i className="fa fa-map-marker text-purple-500 text-xl"></i>
              <span>
                {jobDetails.company.address || "Address not available"}
              </span>
            </p>
            <p className="mt-2 text-sm">
              Status:{" "}
              <span
                className={`font-bold ${
                  jobDetails.status === "Accept"
                    ? "text-green-500"
                    : jobDetails.status === "Pending"
                    ? "text-gray-500"
                    : jobDetails.status === "Reject"
                    ? "text-red-500"
                    : "text-purple-500"
                }`}
              >
                {jobDetails.status}
              </span>
            </p>
            <p className="mt-4 text-gray-700">{jobDetails.description}</p>
            <hr className="my-6" />
            <div className="text-gray-600">
              <ul className="space-y-2">
                <li>
                  <strong>Company:</strong> {jobDetails.company.companyName}
                </li>
                <li>
                  <strong>Job Position:</strong>{" "}
                  {jobDetails.category.categoryName}
                </li>
                <li>
                  <strong>Years of Experience:</strong>{" "}
                  {jobDetails.experienceYears}
                </li>
                <li>
                  <strong>Salary:</strong> {jobDetails.salary}
                </li>
                <li>
                  <strong>Location:</strong> {jobDetails.location}
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
          <img
              src={`http://localhost:8080${jobDetails.company.url}`}
              alt="Company Logo"
              className="rounded-lg shadow-md transition-all hover:scale-105"
            />

            {/* {jobDetails.status === "Expire" ? (
              <button
                className="w-full bg-gray-300 text-gray-600 cursor-not-allowed py-2 px-4 rounded-lg"
                disabled
              >
                Mark to Expire Job
              </button>
            ) : jobDetails.status === "Accept" ? (
              <button
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
                onClick={() => handleStatusChange(jobDetails.jobId)}
              >
                Mark to Expire Job
              </button>
            ) : null} */}

            {/* Show Edit Job Information link if the job state is Frozen */}
            {jobDetails.state === "Frozen" && jobDetails.status === "Accept" &&(
              <a
              href={`/edit-job/${jobDetails.jobId}`}
              className="block bg-purple-500 text-white text-center py-2 px-4 rounded-lg shadow-lg hover:bg-purple-600 transition-all transform hover:scale-105"
            >
              Edit Job Information
            </a>
          )}
          <a
            href={`/questions/loadskilltest/${jobDetails.jobId}`}
            className="block bg-black text-white text-center py-2 px-4 rounded-lg shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            Create Skill Test
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};

export default JobDetailsEmployer;

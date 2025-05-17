import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderEmployer from "../../layout/headeremp";

const EditJob = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`Fetching job details for jobId: ${jobId}`);
    fetch(`http://localhost:8080/edit-job/${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched from backend:", data);
        setJob({
          ...data.job,
          categoryId: data.job.category ? String(data.job.category.categoryId) : "", // Convert to string
        });
        setCategories(data.categories);
        console.log("Categories fetched:", data.categories);
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
      });
  }, [jobId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedJob = {
      jobId: job.jobId,
      title: e.target.title.value,
      categoryId: job.categoryId,
      experienceYears: e.target.experienceYears.value,
      salary: e.target.salary.value,
      location: e.target.location.value,
      description: e.target.description.value,
      startDate: e.target.startDate.value, // New field
      endDate: e.target.endDate.value,       // New field
      applicantCount: e.target.applicantCount.value // New field
    };

    fetch(`http://localhost:8080/update/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedJob),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message || "Job updated successfully!");
          navigate(`/jobdetails/${jobId}`);
        } else {
          alert(data.message || "Failed to update job!");
        }
      })
      .catch((error) => {
        console.error("Error updating job:", error);
      });
  };

  if (!job) {
    console.log("Job data not yet fetched.");
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <HeaderEmployer />
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Job Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Company Name</label>
            <input
              style={{ background: "#f0f0f0" }}
              type="text"
              name="companyName"
              id="name"
              value={job.company.companyName}
              readOnly
              className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Job Title */}
          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              required
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Job Category */}
          <div className="flex flex-col">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Job Category</label>
            <select
              name="categoryId"
              id="category"
              value={job.categoryId}
              onChange={(e) => {
                console.log("Category selected:", e.target.value);
                setJob({ ...job, categoryId: e.target.value });
              }}
              required
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="">--Select Category--</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Years */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col w-full md:w-1/2">
              <label htmlFor="experienceYears" className="text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="experienceYears"
                id="experienceYears"
                value={job.experienceYears}
                onChange={(e) => setJob({ ...job, experienceYears: e.target.value })}
                required
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Salary */}
            <div className="flex flex-col w-full md:w-1/2">
              <label htmlFor="salary" className="text-sm font-medium text-gray-700">Salary ($)</label>
              <input
                type="number"
                name="salary"
                id="salary"
                value={job.salary}
                onChange={(e) => setJob({ ...job, salary: e.target.value })}
                required
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              value={job.location}
              onChange={(e) => setJob({ ...job, location: e.target.value })}
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Job Description */}
          <div className="flex flex-col">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              cols={70}
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={job.startDate}
              onChange={(e) => setJob({ ...job, startDate: e.target.value })}
              required
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={job.endDate}
              onChange={(e) => setJob({ ...job, endDate: e.target.value })}
              required
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Applicant Count */}
          <div className="flex flex-col">
            <label htmlFor="applicantCount" className="text-sm font-medium text-gray-700">Number of Applicants Allowed</label>
            <input
              type="number"
              name="applicantCount"
              id="applicantCount"
              value={job.applicantCount}
              onChange={(e) => setJob({ ...job, applicantCount: e.target.value })}
              required
              min="1"
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
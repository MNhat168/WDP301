import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // For routing
import axios from 'axios'; // Assuming you want to use axios for API calls

const Job = () => {
  const [companyJobs, setCompanyJobs] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const companyId = 1; // Replace with actual company ID dynamically
        const response = await axios.get(`/jobs?companyId=${companyId}`);
        setCompanyJobs(response.data.jobs);
        setCompanyDetails(response.data.company);
        console.log(response.data.company)
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div>
      {/* Preloader */}
      <div id="preloader">
        <div className="jumper">
          <div />
          <div />
          <div />
        </div>
      </div>

      {/* Banner */}
      <div className="banner header-text">
        <div className="owl-banner owl-carousel">
          <div className="banner-item-01">
            <div className="text-content">
              <h4>Find your job today!</h4>
              <h2>Good jobs are here</h2>
            </div>
          </div>
          <div className="banner-item-02">
            <div className="text-content">
              <h4>Jobs of your choice</h4>
              <h2>Good job with good salary</h2>
            </div>
          </div>
          <div className="banner-item-03">
            <div className="text-content">
              <h4>Everything is free</h4>
              <h2>Easy to find a job without losing money</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="latest-products">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-heading">
                <h2>Jobs List By Company</h2>
              </div>
            </div>
            {!companyJobs ? (
              <h5 className="text-center">Company not found !!!</h5>
            ) : (
              <div className="row">
                <div className="col-md-7">
                  <div className="row">
                    {companyJobs.length === 0 ? (
                      <h5 className="text-center">The company currently has no jobs.</h5>
                    ) : (
                      companyJobs.map((job) => (
                        <div className="col-md-4 mb-5" key={job.jobId}>
                          <div className="card">
                            <div className="card-body">
                              <h5 className="card-title">{job.title}</h5>
                              <h6 className="card-subtitle mb-2 text-muted">{job.description}</h6>
                              <h6 className="card-subtitle mb-2 text-muted">{job.salary} Salary</h6>
                              <h6 className="card-subtitle mb-2 text-muted">{job.experienceYears} Experience</h6>
                              <a href={`/jobs-detail?jobId=${job.jobId}`} className="btn btn-success">
                                View Detail
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="col-md-5">
                  <div>
                    <img
                      className="w-100"
                      src={`http://localhost:8080${company.url}`}
                      alt="Company"
                    />
                    <h5 className="mt-3">
                      <span>Company Name: {companyDetails?.companyName}</span>
                    </h5>
                    <div className="mt-2">
                      <span>Job Position: </span>
                      <b>{companyDetails?.address}</b>
                      <br />
                      <span>About Us: </span>
                      <b>{companyDetails?.aboutUs}</b>
                      <br />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Job;

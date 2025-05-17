import React, { useEffect, useState } from 'react';
import Header from "../../layout/header";

const FavoriteJob = () => {

  const favoriteJobs = JSON.parse(localStorage.getItem("favoriteJobs"));
  const deleteFavorite = (favoriteId) => {
    fetch("http://localhost:8080/favorite-jobs/delete?jobId=${favoriteId}")
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete favorite job');
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          alert("Job successfully deleted from favorites");
          
          // Cập nhật state sau khi job được xóa thành công từ backend
          const updatedFavorites = favoriteJobs.filter(job => job.jobId !== favoriteId);
          setFavoriteJobs(updatedFavorites); // Cập nhật state
  
          // Lưu lại vào localStorage
          localStorage.setItem("favoriteJobs", JSON.stringify(updatedFavorites));
        }
      })
      .catch(error => console.error('Error deleting favorite job:', error));
  };  

  return (
    <>
    <Header/>
    <div id="preloader">
  <div className="jumper">
    <div />
    <div />
    <div />
  </div>
</div>

{/* Favorite Jobs List */}
<div className="latest-products" style={{ backgroundColor: "#f8f9fa", padding: "40px 0" }}>
  <div className="container" style={{ maxWidth: "1200px" }}>
    <div className="row mb-5">
      <div className="col-md-12 text-center">
        <div className="section-heading">
          <h2 style={{ fontSize: "2.5rem", color: "#212529", fontWeight: "bold" }}>Favorite Jobs</h2>
          <p style={{ color: "#495057", fontSize: "1.2rem" }}>
            Your saved jobs at a glance
          </p>
        </div>
      </div>
    </div>
    <div className="row">
      {favoriteJobs.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#6c757d",
            fontStyle: "italic",
            fontSize: "1.2rem",
          }}
        >
          No favorite jobs found
        </p>
      ) : (
        favoriteJobs.map((job) => (
          <div className="col-md-12 mb-4" key={job.jobId}>
            <div
              className="card h-100 shadow-lg"
              style={{
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                overflow: "hidden",
                padding: "20px",
              }}
            >
              <div className="row g-0">
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title" style={{ fontWeight: "bold", color: "#0056b3" }}>
                      {job.title}
                    </h5>
                    <p className="card-text" style={{ fontSize: "1rem", color: "#212529" }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          marginRight: "10px",
                        }}
                      >
                        {job.location}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          marginRight: "10px",
                        }}
                      >
                        {job.experienceYears} Years
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#ffc107",
                          color: "black",
                          marginRight: "10px",
                        }}
                      >
                        {job.status}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#17a2b8",
                          color: "white",
                          marginRight: "10px",
                        }}
                      >
                        {job.salary}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#6c757d",
                          color: "white",
                        }}
                      >
                        {job.companyName}
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className="col-md-4 d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "#f1f3f5",
                    borderLeft: "3px solid #dee2e6",
                  }}
                >
                  <a
                    className="btn btn-primary mr-3"
                    href={`/jobs-detail?jobId=${job.jobId}`}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                    }}
                  >
                    Detail Now
                  </a>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteFavorite(job.jobId)}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>


    </>
  );
};

export default FavoriteJob;
import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderEmployer from "../../layout/headeremp";
import Hero from "../../layout/Hero";
import Features from "../../layout/Features";
import TestimonialEmp from "../../layout/TestimonialEmp";
import Footer from "../../Footer/Footer";
import useBanCheck from "../admin/checkban"; // Import ban check hook
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto"; // Use the default import from chart.js
import ChatBox from "../../layout/chatbox";

const HomeEmp = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [applicationsByMonth, setApplicationsByMonth] = useState([]);
  const [jobCounts, setJobCounts] = useState({
    accept: 0,
    reject: 0,
    pending: 0,
    cvApplied: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BanPopup = useBanCheck();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await axios.get(
            "http://localhost:8080/user/current",
            { withCredentials: true }
          );
          setUser(response.data || storedUser);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) setUser(storedUser);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchUserData();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/dashboard/${user.userId}`,
            { withCredentials: true }
          );
          setCompany(response.data.company);
          setApplicationsByMonth(response.data.applicationsByMonth);
          setJobCounts({
            accept: response.data.accept,
            reject: response.data.reject,
            pending: response.data.pending,
            cvApplied: response.data.cvApplied,
          });
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to load dashboard data");
        }
      };

      fetchDashboardData();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data available</div>;

  // Chart Data for Applicant Chart
  const applicantChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Number of Applicants",
        data: applicationsByMonth,
        backgroundColor: "rgba(255, 193, 7, 0.6)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Job Status Pie Chart Data
  const jobStatusChartData = {
    labels: ["Job Accept", "Job Reject"],
    datasets: [
      {
        label: "Job Status",
        data: [jobCounts.accept, jobCounts.reject],
        backgroundColor: ["rgba(40, 167, 69, 0.8)", "rgba(220, 53, 69, 0.8)"],
        borderColor: ["rgba(40, 167, 69, 1)", "rgba(220, 53, 69, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      {BanPopup}
      <ChatBox />
      <HeaderEmployer />

      <div className="container mt-5">
        {/* Title */}
        <div className="row flex justify-center items-center mb-4">
          <h1 className="text-center text-4xl font-bold mb-8 relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            <span className="absolute -z-10 inset-0 blur-md opacity-20 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full"></span>
            Your Dashboard
          </h1>
        </div>

        {/* Job Counts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-green-500 shadow-lg p-6 rounded-lg text-center bg-white hover:scale-105 transition-transform">
            <h5 className="text-green-500 text-lg font-semibold mb-2">
              Job Accept
            </h5>
            <div className="text-green-500 text-4xl font-bold">
              {jobCounts.accept}
            </div>
          </div>

          <div className="border border-red-500 shadow-lg p-6 rounded-lg text-center bg-white hover:scale-105 transition-transform">
            <h5 className="text-red-500 text-lg font-semibold mb-2">
              Job Reject
            </h5>
            <div className="text-red-500 text-4xl font-bold">
              {jobCounts.reject}
            </div>
          </div>

          <div className="border border-gray-500 shadow-lg p-6 rounded-lg text-center bg-white hover:scale-105 transition-transform">
            <h5 className="text-gray-500 text-lg font-semibold mb-2">
              Job Pending
            </h5>
            <div className="text-gray-500 text-4xl font-bold">
              {jobCounts.pending}
            </div>
          </div>

          <div className="border border-yellow-500 shadow-lg p-6 rounded-lg text-center bg-white hover:scale-105 transition-transform">
            <h5 className="text-yellow-500 text-lg font-semibold mb-2">
              CV Applied
            </h5>
            <div className="text-yellow-500 text-4xl font-bold">
              {jobCounts.cvApplied}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Number of Applicants Per Month
            </h3>
            <div className="h-[400px]">
              <Bar
                data={applicantChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-4">Job Status Chart</h3>
            <div className="h-[300px] w-full">
              <Pie
                data={jobStatusChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        let sum = context.chart.data.datasets[0].data.reduce(
                          (acc, data) => acc + data,
                          0
                        );
                        return ((value * 100) / sum).toFixed(2) + "%";
                      },
                      color: "#fff",
                      font: { weight: "bold", size: 14 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Hero />
      <Features />
      <TestimonialEmp />
      <Footer />
    </>
  );
};

export default HomeEmp;

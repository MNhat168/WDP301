import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from "../../layout/header";

import DoTest from '../employer/dotest';

const JobDetail = () => {
    const [job, setJob] = useState(null);
    const [user, setUser] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [testCompleted, setTestCompleted] = useState(false);
    const [questionExist, setQuestionExist] = useState(false);
    const [cvProfile, setCvProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState(null);
    const navigate = useNavigate(); // Khai báo hook useNavigate
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const jobId = new URLSearchParams(window.location.search).get("jobId");
                const response = await axios.get("http://localhost:8080/jobs-detail", {
                    params: { jobId },
                    withCredentials: true,
                });
                const data = response.data;
                console.log(data);
                setJob(data.job);
                setUser(data.user);
                setApplicationId(data.applicationId);
                setCvProfile(data.cvProfile);
                setTestCompleted(data.testCompleted);
                setQuestionExist(data.questionExist);
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, []);

    const openModal = () => {
        setModalData(user);  // Display user data in the modal
    };

    const closeModal = () => {
        setModalData(null); // Close the modal
    };

    const handleApplyJob = () => {
        const userId = document.getElementById("userId").value;
        if (userId === 'false') {
            alert("Bạn cần phải đăng nhập");
            return;
        }
        openModal();  // Open the modal when the user clicks "Apply to Job"
    };

    const applyJob = async () => {
        const jobId = job.jobId;
        try {
            const response = await axios.post('http://localhost:8080/application/create', null, {
                params: { jobId },
                withCredentials: true,
            });

            alert("Apply thành công!");
            setApplicationId(response.data.applicationId);
            setTestCompleted(false);
            closeModal();

            // Reload the page to refresh the state
            window.location.reload();
        } catch (error) {
            console.error('Error applying to job:', error);
            if (error.response && error.response.status === 409) {
                alert("Bạn đã apply công việc này rồi!");
            } else if (error.response && error.response.status === 401) {
alert("Bạn cần phải đăng nhập!");
            }
        }
    };

    const handleWithdrawApplication = async () => {
        try {
            if (!applicationId) {
                alert("Không có đơn ứng tuyển để rút lại.");
                return;
            }

            const response = await axios.delete('http://localhost:8080/application/delete', {
                params: { applicationId },
                withCredentials: true,
            });

            alert("Rút đơn ứng tuyển thành công.");
            setApplicationId(null); // Reset trạng thái applicationId về null sau khi rút thành công
        } catch (error) {
            console.error('Error withdrawing application:', error);
            if (error.response && error.response.status === 404) {
                alert("Đơn ứng tuyển không tồn tại hoặc đã bị xóa.");
            } else if (error.response && error.response.status === 401) {
                alert("Bạn cần phải đăng nhập!");
            } else {
                alert("Có lỗi xảy ra khi rút đơn ứng tuyển.");
            }
        }
    };

    const handleFavoriteJob = () => {
        // const jobId = job.jobId;
        const userId = document.getElementById("userId").value;
        if (userId === 'false') {
            alert("Bạn cần phải đăng nhập");
            return;
        }
        const favoriteJobs = JSON.parse(localStorage.getItem("favoriteJobs"));
        const request = {
            "jobId": job.jobId,
            "location": job?.location,
            "description": job?.description,
            "companyName": job.company.companyName,
            "salary": job.salary,
            "experienceYears": job.experienceYears,
            "address": job.company.address,
            "title": job.title,
            "status": job.status,
        }
        if (!favoriteJobs) {
            localStorage.setItem("favoriteJobs", JSON.stringify([request]));
            alert("Lưu công việc thành công");
        } else {
            const jobIds = favoriteJobs.map((item) => item.jobId)
            if (jobIds.includes(job.jobId)) {
                alert("Công việc đã có trong danh sách yêu thích");
            } else {
                localStorage.setItem("favoriteJobs", JSON.stringify([request, ...favoriteJobs]));
            }
        }

    };
      
  // Định nghĩa hàm xử lý khi nhấn nút
  const handleSkillTestClick = () => {
    if (job && job.jobId) {
      navigate("/doskilltest", { state: { jobId: job.jobId } }); // Chuyển hướng đến trang /doskilltest với jobId
    }
  };

        // axios.get(http://localhost:8080/favorite-jobs/save?id=${jobId}, { withCredentials: true })
        //     .then(response => {
        //         if (response.data) {
        //             alert("Lưu công việc thành công");
        //         } else {
        //             alert("Công việc đã có trong danh sách yêu thích");
        //         }
        //     })
        //     .catch(error => {
        //         console.error('Error saving favorite job:', error);
        //         alert("Có lỗi xảy ra khi lưu công việc yêu thích.");
        //     });


    if (loading) {
        return <div className="text-center text-lg">Loading...</div>;
    }

    if (!job) {
        return <div className="text-center text-lg">Job not found</div>;
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100">
                {/* Banner Section */}
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-center py-12">
                    <h4 className="text-lg font-semibold">Find Your Job Today!</h4>
                    <h2 className="text-4xl font-bold mt-2">Good Jobs Are Here</h2>
                </div>

                {/* Detail Jobs Section */}
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Detail Jobs</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-7 bg-white p-6 shadow-lg rounded-md">
                            <div className="mb-4 text-sm text-gray-600">
                                <span className="mr-2">🔴 {job.location}</span>
                                <span className="mr-2">🔴 {job.date}</span>
                                <span className="mr-2">🔴 Contract</span>
                            </div>
                            <p className="text-gray-700 mb-4">{job.description}</p>

                            <h6 className="text-lg font-semibold text-gray-800 mb-4">
                                Exciting Career at {job.company.companyName}
                            </h6>

                            <div className="space-y-2">
                                <div className="font-semibold">* Conditions met</div>
                                <p>
                                    <span className="text-gray-600">Company Name: </span>
                                    <b>{job.company.companyName}</b>
                                </p>
                                <p>
                                    <span className="text-gray-600">Job Position: </span>
                                    <b>{job.company.address}</b>
                                </p>
                                <p>
<span className="text-gray-600">Year Experience: </span>
                                    <b>{job.experienceYears}</b>
                                </p>
                                <p>
                                    <span className="text-gray-600">Salary: </span>
                                    <b>{job.salary}</b>
                                </p>
                                <p>
                                    <span className="text-gray-600">Location: </span>
                                    <b>{job.location}</b>
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 shadow-lg rounded-md">
                                {job.state === "Frozen" ? (
                                    <p className="text-red-500 font-semibold">
                                        The job is currently full. Please check back later.
                                    </p>
                                ) : applicationId == null ? (
                                    <button
                                        className="btn bg-yellow-500 text-white w-full py-2 mb-2 hover:bg-yellow-600"
                                        onClick={handleApplyJob}
                                    >
                                        Apply To This Job
                                        <input hidden id="userId" value={user ? "true" : "false"} />
                                    </button>
                                ) : (
                                    <>
                                        {applicationId != null && (!testCompleted || !questionExist) ? (
                                            <button
                                                className="btn bg-yellow-500 text-white w-full py-2 mb-2 hover:bg-yellow-600"
                                                onClick={handleSkillTestClick} // Gọi hàm khi click
                                            >
                                                Do Skill Test
                                            </button>
                                        ) : (
                                            console.log("Test Completed")
                                        )}
                                        <button
                                            className="btn bg-red-500 text-white w-full py-2 mb-2 hover:bg-red-600"
                                            onClick={handleWithdrawApplication}
                                        >
                                            Withdraw Job Application
                                        </button>
                                    </>
                                )}
                                <button
className="btn bg-yellow-500 text-white w-full py-2 hover:bg-yellow-600"
                                    onClick={handleFavoriteJob}
                                >
                                    Save Favorite Job
                                    <input hidden id="userId" value={user ? "true" : "false"} readOnly />
                                </button>
                            </div>

                            <div className="mt-6">
                                <img
                                    className="w-full rounded-md"
                                    src="https://static.kinhtedothi.vn/images/upload/2021/12/25/27046022-766e-43fe-9996-c6c41028421e.jpg"
                                    alt="Company"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for user profile and job application */}
            {modalData && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    role="dialog"
                >
                    <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h5 className="text-lg font-semibold">User Profile</h5>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={closeModal}
                            >
                                <span className="text-2xl font-bold">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Side */}
                            <div className="text-center">
                                <div className="bg-blue-600 text-white p-3 rounded-md">
                                    Welcome, <p>{modalData?.email || "N/A"}</p>
                                </div>
                                <img
                                    src={cvProfile?.avatar ? `http://localhost:8080${cvProfile.avatar}` : '/default-avatar.jpg'}
                                    alt="Avatar"
                                    style={{ width: '100%' }}
                                />
                                <h5 className="mt-4 font-bold text-gray-800">
                                    {modalData?.firstName} {modalData?.lastName}
                                </h5>
                                <div>
                                    <h6 style={{
                                        backgroundColor: '#0d64fb',
                                        color: 'white',
padding: '5px'
                                    }}>Education:</h6>
                                    <p>{cvProfile?.education || 'N/A'}</p>
                                    <h6 style={{
                                        backgroundColor: '#0d64fb',
                                        color: 'white',
                                        padding: '5px'
                                    }}>Skills:</h6>
                                    <p>{cvProfile?.skills || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="lg:col-span-2">
                                <h4 className="text-xl font-bold mb-4">Profile</h4>
                                <table className="table-auto w-full">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold">Email</td>
                                            <td>{modalData?.email || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold">Phone Number</td>
                                            <td>{modalData?.phoneNumber || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td>City</td>
                                            <td>{modalData?.city || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td>Experience</td>
                                            <td>{cvProfile?.experience || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td>Certifications</td>
                                            <td>{cvProfile?.certifications || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td>Link Pdf</td>
                                            <td>
                                                {cvProfile?.linkPdf ? (
                                                    <div>
                                                        <button
                                                            style={{
                                                                backgroundColor: '#0d64fb',
                                                                color: 'white',
                                                                padding: '5px',
                                                                marginRight: '10px'
                                                            }}
onClick={() => window.open(
                                                                cvProfile.linkPdf.startsWith('http')
                                                                    ? cvProfile.linkPdf
                                                                    : `http://localhost:8080${cvProfile.linkPdf}`,
                                                                '_blank'
                                                            )}
                                                        >
                                                            Show More
                                                        </button>
                                                        <button
                                                            style={{
                                                                backgroundColor: '#28a745',
                                                                color: 'white',
                                                                padding: '5px'
                                                            }}
                                                            onClick={() => {
                                                                const fileUrl = cvProfile.linkPdf.startsWith('http')
                                                                    ? cvProfile.linkPdf
                                                                    : `http://localhost:8080${cvProfile.linkPdf}`;

                                                                fetch(fileUrl)
                                                                    .then(response => {
                                                                        if (!response.ok) {
                                                                            throw new Error('Network response was not ok');
                                                                        }
                                                                        return response.blob(); // Lấy dữ liệu dưới dạng blob
                                                                    })
                                                                    .then(blob => {
                                                                        const link = document.createElement('a');
                                                                        const url = URL.createObjectURL(blob); // Tạo URL từ blob
                                                                        link.href = url;
                                                                        link.setAttribute('download', 'application.pdf'); // Đặt tên file tải về
                                                                        document.body.appendChild(link);
                                                                        link.click();
document.body.removeChild(link);
                                                                        URL.revokeObjectURL(url); // Xóa URL blob để giải phóng bộ nhớ
                                                                    })
                                                                    .catch(error => {
                                                                        console.error('File download failed:', error); // Hiển thị lỗi nếu có
                                                                    });
                                                            }}
                                                        >
                                                            Download
                                                        </button>

                                                    </div>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-6 flex justify-end space-x-4">
                            <button className="btn bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" onClick={applyJob}>
                                Confirm Application
                            </button>
                            <button className="btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
};


export default JobDetail;

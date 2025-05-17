import React, { useState, useEffect } from 'react';
import HeaderEmployer from "../../layout/headeremp";

const ApproveCv = () => {
  const [applications, setApplications] = useState([]);
  const [modalData, setModalData] = useState(null);

  // Fetch applications data from the server
  useEffect(() => {
    fetch('http://localhost:8080/approve-cv/list', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        // Convert applicationDate string into Date object
        const transformedData = data.map(application => ({
          ...application,
          applicationDate: new Date(application.applicationDate), // Convert to Date
        }));
        setApplications(transformedData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  const openModal = (data) => {
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
  };

  // Handle accepting a talent
  const acceptTalent = (applicationId) => {
    fetch(`http://localhost:8080/approve-cv/accept?applicationId=${applicationId}`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(() => {
        alert('Talent accepted');
        closeModal();
        window.location.reload(); // Refresh the list
      })
      .catch(error => console.error('Error accepting talent:', error));
  };

  // Handle rejecting a talent
  const rejectTalent = (applicationId) => {
    fetch(`http://localhost:8080/approve-cv/reject?applicationId=${applicationId}`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(() => {
        alert('Talent rejected');
        closeModal();
        window.location.reload(); // Refresh the list
      })
      .catch(error => console.error('Error rejecting talent:', error));
  };

  return (
    <>
      <HeaderEmployer />
      <div className="container mx-auto mt-5">
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Job Apply</th>
                <th className="px-4 py-2">Apply Date</th>
                <th className="px-4 py-2">Test Status</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((data, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  <td className="px-4 py-2">{data.firstName} {data.lastName}</td>
                  <td className="px-4 py-2">{data.email}</td>
                  <td className="px-4 py-2">{data.phoneNumber || "TBA"}</td>
                  <td className="px-4 py-2">{data.jobTitle}</td>
                  <td className="px-4 py-2">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(data.applicationDate)}
                  </td>
                  <td className="px-4 py-2">{data.testStatus}</td>
                  <td className="px-4 py-2">{data.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                      onClick={() => openModal(data)}
                    >
                      Detail
                    </button>
                    {data.testStatus === "completed" && (
                      console.log("status:",data),
                      <a
                        href={data.testResultLink}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Test Result
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalData && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          aria-labelledby="exampleModalLabel"
          aria-hidden="false"
        >
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full">
            <div className="bg-blue-500 text-white px-6 py-3 flex justify-between items-center">
              <h5 className="text-xl font-semibold">CV Profile</h5>
              <button
                type="button"
                className="text-white text-2xl hover:text-gray-300 focus:outline-none"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <img
                    src={modalData?.avatar ? `http://localhost:8080${modalData.avatar}` : "/default-avatar.jpg"}
                    alt="Avatar"
                    className="w-32 h-32 object-cover rounded-full shadow-md mb-4"
                  />
                  <h5 className="text-lg font-semibold mb-2">{modalData?.firstName} {modalData?.lastName}</h5>
                  <p className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {modalData?.email || "N/A"}
                  </p>
                  <h6 className="mt-4 font-bold text-gray-600">Education:</h6>
                  <p className="text-sm">{modalData?.education || "N/A"}</p>
                  <h6 className="mt-4 font-bold text-gray-600">Skills:</h6>
                  <p className="text-sm">{modalData?.skills || "N/A"}</p>
                </div>
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold mb-4">Profile Details</h4>
                  <table className="table-auto w-full text-sm border-collapse border border-gray-200">
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 font-medium border border-gray-200">Email</td>
                        <td className="px-4 py-2 border border-gray-200">{modalData?.email || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium border border-gray-200">Phone Number</td>
                        <td className="px-4 py-2 border border-gray-200">{modalData?.phoneNumber || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium border border-gray-200">Date Of Birth</td>
                        <td className="px-4 py-2 border border-gray-200">{modalData?.dateOfBirth || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium border border-gray-200">City</td>
                        <td className="px-4 py-2 border border-gray-200">{modalData?.city || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium border border-gray-200">Experience</td>
                        <td className="px-4 py-2 border border-gray-200">{modalData?.experience || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Link Pdf</td>
                        <td className="px-4 py-2">
                          {modalData?.linkPdf ? (
                            <div>
                              <button
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg mr-2"
                                onClick={() => window.open(
                                  modalData.linkPdf.startsWith('http')
                                    ? modalData.linkPdf
                                    : `http://localhost:8080${modalData.linkPdf}`,
                                  '_blank'
                                )}
                              >
                                Show More
                              </button>
                              <button
                                className="bg-green-500 text-white py-2 px-4 rounded-lg"
                                onClick={() => {
                                  const fileUrl = modalData.linkPdf.startsWith('http')
                                    ? modalData.linkPdf
                                    : `http://localhost:8080${modalData.linkPdf}`;

                                  fetch(fileUrl)
                                    .then(response => response.blob())
                                    .then(blob => {
                                      const link = document.createElement('a');
                                      const url = URL.createObjectURL(blob);
                                      link.href = url;
                                      link.setAttribute('download', 'application.pdf');
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                    })
                                    .catch(error => console.error('File download failed:', error));
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
            </div>
            <div className="bg-gray-100 px-6 py-3 flex justify-end space-x-4">
              {modalData?.status === "pending" && (
                <>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={() => rejectTalent(modalData.applicationId)}
                  >
                    Reject Talent
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    onClick={() => acceptTalent(modalData.applicationId)}
                  >
                    Accept Talent
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ApproveCv;
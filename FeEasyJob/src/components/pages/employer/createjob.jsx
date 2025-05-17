import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"; // Correct library for geosearch
import "leaflet-geosearch/dist/geosearch.css"; // Styles for the search box
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from "../admin/checkban";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const CreateJob = () => {
  const [categories, setCategories] = useState([]);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    namework: "",
    cateID: "",
    experiences: "",
    salary: "",
    location: "",
    description: "",
    startDate: "", // New field for start date
    endDate: "",   // New field for end date
    applicantCount: 0, // New field for applicant count
  });
  const [message, setMessage] = useState(null);
  const [position, setPosition] = useState([0, 0]); // Initial position
  const [isLocationFetched, setIsLocationFetched] = useState(false); // Location fetch status
  const BanPopup = useBanCheck();
  const [location, setLocation] = useState(""); // Store address string
  const [endDateError, setEndDateError] = useState(""); // State for end date validation error

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8080/create-job", {
          method: "GET",
          credentials: "include", // Send cookie
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
          setCompany(data.company || null);
        } else {
          setMessage({ type: "error", text: "Failed to fetch data from server." });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ type: "error", text: "An error occurred while fetching data." });
      }
    }

    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Coordinates fetched:", latitude, longitude);
          setPosition([latitude, longitude]); // Update position
          setIsLocationFetched(true);
        },
        (error) => {
          console.error(error);
          setMessage({ type: "error", text: "Unable to retrieve your location." });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    } else {
      setMessage({ type: "error", text: "Geolocation is not supported by this browser." });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate end date if it's being changed
    if (name === "endDate") {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(value); // Use the new value for end date

      if (startDate && endDate < startDate) {
        setEndDateError("End date cannot be before start date.");
      } else {
        setEndDateError(""); // Clear the message if validation passes
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      setEndDateError("End date cannot be before start date.");
      return;
    }

    if (!formData.namework || !formData.cateID || !formData.startDate || !formData.endDate || formData.applicantCount <= 0) {
      setMessage({ type: "error", text: "Please fill in all required fields and ensure applicant count is greater than 0." });
      return;
    }

    const payload = {
      ...formData,
      location: location || `${position[0]}, ${position[1]}`, // Save location
    };

    try {
      const response = await fetch("http://localhost:8080/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: data.message });
        // Reset form data if needed
        setFormData({
          namework: "",
          cateID: "",
          experiences: "",
          salary: "",
          location: "",
          description: "",
          startDate: "",
          endDate: "",
          applicantCount: 0, // Reset applicant count after job creation
        });
        setEndDateError(""); // Clear any error messages
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to create job." });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "An error occurred while sending the request." });
    }
  };

  // Custom component for adding the search control
  const SearchBar = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider,
        style: "bar", // Use bar style
        autoClose: true,
        showMarker: true, // Display marker on the map
        keepResult: true, // Keep search result open
      });

      map.addControl(searchControl);

      // Event listener for when a search result is selected
      map.on("geosearch/showlocation", (e) => {
        const { x, y, label } = e.location;
        setPosition([y, x]); // Update position
        setLocation(label); // Update address string
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null; // This component doesn't render anything visible itself
  };

  if (!isLocationFetched) {
    return <div>Loading your location...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <HeaderEmployer />
      <div className="container w-[90%] mx-auto my-5">
        <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Left Side: Image */}
          <div className="lg:w-1/2 flex justify-center items-center">
            <img
              src="./images/signup-img.jpg"
              alt="signup"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-1/2 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-3xl font-semibold text-center text-blue-600">
                Post a Job Opening
              </h2>
              {message && (
                <h3
                  className={`text-center text-xl ${message.type === "error"
                    ? "text-red-500"
                    : "text-green-500"
                    }`}
                >
                  {message.text}
                </h3>
              )}

              {/* Company Name */}
              <div className="form-group">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-building text-blue-500 mr-2"></i>
                  Company Name:
                </label>
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <p className="text-blue-800 font-semibold">
                    {company?.companyName || "No company found"}
                  </p>
                </div>
              </div>

              {/* Job Title */}
              <div className="form-group">
                <label
                  htmlFor="namework"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-briefcase text-blue-500 mr-2"></i>
                  Job Title:
                </label>
                <input
                  type="text"
                  name="namework"
                  id="namework"
                  placeholder="Enter job title"
                  value={formData.namework}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                />
              </div>

              {/* Job Category */}
              <div className="form-group">
                <label
                  htmlFor="cateID"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-layer-group text-blue-500 mr-2"></i>
                  Job Category:
                </label>
                <select
                  name="cateID"
                  id="cateID"
                  value={formData.cateID}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                >
                  <option value="">--Select Category--</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="form-group">
                <label
                  htmlFor="experiences"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-cogs text-blue-500 mr-2"></i>
                  Experience Level:
                </label>
                <input
                  type="number"
                  name="experiences"
                  id="experiences"
                  placeholder="Experience in years"
                  value={formData.experiences}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                />
              </div>

              {/* Salary */}
              <div className="form-group">
                <label
                  htmlFor="salary"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-dollar-sign text-blue-500 mr-2"></i>
                  Salary:
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  placeholder="Enter salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="applicantCount"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-users text-blue-500 mr-2"></i>
                  Number of Applicants Allowed:
                </label>
                <input
                  type="number"
                  name="applicantCount"
                  id="applicantCount"
                  value={formData.applicantCount}
                  onChange={handleInputChange}
                  required
                  min="1" // Ensure at least one applicant is allowed
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                />
              </div>
              <div className="form-group flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="startDate" className="block text-gray-700 font-medium flex items-center">
                    <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                    Start Date:
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                  />
                </div>

                <div className="w-1/2">
                  <label htmlFor="endDate" className="block text-gray-700 font-medium flex items-center">
                    <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                    End Date:
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                  />
                  {endDateError && (
                    <p className="text-red-500 text-sm mt-1">{endDateError}</p> // Display error message below the input
                  )}
                </div>
              </div>

              {/* Location Picker */}
              <div className="form-group">
                <label className="block text-gray-700 font-medium flex items-center">
                  <i className="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                  Location:
                </label>
                <div style={{ position: "relative", zIndex: 0 }}>
                  <MapContainer
                    center={position}
                    zoom={12}
                    style={{ width: "100%", height: "400px" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position}>
                      <Popup>Current Location</Popup>
                    </Marker>
                    <SearchBar />
                  </MapContainer>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label
                  htmlFor="description"
                  className="block text-gray-700 font-medium flex items-center"
                >
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Job Description:
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="4"
                  placeholder="Enter job description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-2 border rounded-md bg-white text-gray-700"
                />
              </div>

              {/* Submit Button */}
              <div className="form-group">
                <button
                  type="submit"
                  className="w-full p-4 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
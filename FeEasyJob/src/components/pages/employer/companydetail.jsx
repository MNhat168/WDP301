import React, { useEffect, useState } from "react";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from "../admin/checkban";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";

const CompanyDetail = () => {
  const [companyData, setCompanyData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    aboutUs: "",
    address: "",
    image: null,
  });
  const [location, setLocation] = useState(""); // For address string
  const [position, setPosition] = useState([0, 0]); // For lat/lon position
  const BanPopup = useBanCheck();

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = () => {
    fetch("http://localhost:8080/create-or-update-company-profile", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCompanyData({ com: data });
        setEditFormData({
          companyName: data.companyName || "",
          aboutUs: data.aboutUs || "",
          address: data.address || "",
          image: null,
        });
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
        }
      })
      .catch((error) => console.error("Error fetching company profile:", error));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", editFormData.companyName);
    formData.append("aboutus", editFormData.aboutUs);
    formData.append("address", editFormData.address);
    console.log(editFormData.address);
    if (editFormData.image) formData.append("image", editFormData.image);

    try {
      const response = await fetch("http://localhost:8080/save-company-profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanyData({ com: data });
      setIsEditModalOpen(false);
      fetchCompanyData();
      
    } catch (error) {
      console.error("Error saving company profile:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const SearchBar = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        autoClose: true,
        showMarker: true,
        keepResult: true,
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", (e) => {
        const { x, y, label } = e.location;
        setPosition([y, x]); // Update latitude and longitude
        setLocation(label); // Update the address
        handleInputChange("address", label); // Save the actual address in editFormData
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  if (!companyData) {
    return <div>Loading...</div>;
  }

  const isNewCompany = !companyData.com;

  const EditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Company Profile
            </h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editFormData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Description
                </label>
                <textarea
                  rows="4"
                  value={editFormData.aboutUs}
                  onChange={(e) =>
                    handleInputChange("aboutUs", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <MapContainer
                  center={position}
                  zoom={12}
                  style={{ width: "100%", height: "400px" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position}>
                    <Popup>{location || "Current Location"}</Popup>
                  </Marker>
                  <SearchBar />
                </MapContainer>
                <p className="text-sm text-gray-500 mt-2">
                  Selected Address: {editFormData.address}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange("image", e.target.files[0])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {BanPopup}
      <div className="min-h-screen bg-gray-50">
        <HeaderEmployer />

        {isNewCompany ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Create Company</h1>
            </div>

            <form
              className="bg-white rounded-lg shadow-md p-6"
              action="/save-company-profile"
              method="post"
              encType="multipart/form-data"
            >
              <h5 className="text-xl font-semibold text-gray-700 mb-6">Your company profile here!</h5>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Company Name
                </label>
                <input
                  name="name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Your Company Description
                </label>
                <textarea
                  name="aboutus"
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your company"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company address"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Upload Company Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
              >
                Create Company
              </button>
            </form>
          </div>
        ) : (
          <div className="relative">
            <div
              className="h-[500px] bg-cover bg-center relative"
              style={{
                backgroundImage: "url(/assets/images/heading-6-1920x500.jpg)",
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backgroundBlend: 'overlay'
              }}
            >
              <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <img
                      src={`http://localhost:8080${companyData.com.url || "/assets/images/default-image.jpg"}`}
                      className="w-full h-80 object-contain bg-white rounded-lg shadow-lg"
                      alt="Company"
                    />
                  </div>

                  <div className="md:w-2/3 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <i className="fas fa-map-marker-alt text-orange-500 text-3xl"></i>
                      <p className="text-xl">{companyData.com.address}</p>
                    </div>

                    <div className="mb-4">
                      {companyData.com.status === "Active" ? (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                          {companyData.com.status}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                          {companyData.com.status}
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-orange-500 mb-4">
                      {companyData.com.companyName}
                    </h2>

                    <p className="text-gray-200 text-lg mb-6">
                      {companyData.com.aboutUs}
                    </p>

                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition duration-200"
                    >
                      Edit Company Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <EditModal />
      </div>
    </>
  );
};

export default CompanyDetail;

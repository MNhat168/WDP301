import React, { useState, useEffect } from 'react';
import HeaderEmployer from '../../layout/headeremp';
import useBanCheck from '../admin/checkban';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"; // Correct library for geosearch
import "leaflet-geosearch/dist/geosearch.css"; // Styles for the search box

const EditProfileCompany = () => {
  const [companyData, setCompanyData] = useState({
    companyName: '',
    aboutUs: '',
    address: '',
    image: null,
    location: [0, 0], // lat, lng for location
  });
  const [message, setMessage] = useState(null);
  const BanPopup = useBanCheck();

  useEffect(() => {
    fetch("http://localhost:8080/edit-profile-company", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCompanyData({
          companyName: data.companyName || '',
          aboutUs: data.aboutUs || '',
          address: data.address || '',
          image: null,
          location: data.location ? data.location.split(',').map(Number) : [0, 0],
        });
      })
      .catch((error) => {
        console.error('Error fetching company profile:', error);
      });
  }, []);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await response.json();
      return data.display_name; // This will give you the address as a string
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Unable to fetch address.";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", companyData.companyName);
    formData.append("aboutus", companyData.aboutUs);
    formData.append("address", companyData.address || ""); // Ensure address is always a string
    formData.append("location", `${companyData.location[0]},${companyData.location[1]}`);

    if (companyData.image) {
      formData.append("image", companyData.image);
    }

    fetch("http://localhost:8080/save-company-profile", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Company profile updated:', data);
        window.location.href = "/create-or-update-company-profile";
      })
      .catch((error) => {
        console.error('Error saving company profile:', error);
      });
  };


  const LocationPicker = ({ position, setPosition, setAddress }) => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setPosition([lat, lng]); // Update position with the new lat/lng
        // Fetch the address from the lat/lng using reverse geocoding
        getAddressFromCoordinates(lat, lng).then((address) => {
          setAddress(address); // Set the address string instead of lat/lng
        });
      },
    });

    return (
      <Marker position={position}>
        <Popup>{companyData.address || "Choose your location"}</Popup>
      </Marker>
    );
  };

  return (
    <>
      {BanPopup}
      <div className="min-h-screen bg-gray-50">
        <HeaderEmployer />

        <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
          <form
            className="bg-white rounded-lg shadow-md p-8"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <h5 className="text-2xl font-semibold text-gray-800 mb-6">
              Your company profile here!
            </h5>

            {/* Company Name */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Company Name
              </label>
              <input
                value={companyData.companyName}
                onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                name="name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>

            {/* Company Description */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Your Company Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                name="aboutus"
                rows={5}
                value={companyData.aboutUs}
                onChange={(e) => setCompanyData({ ...companyData, aboutUs: e.target.value })}
                placeholder="Describe your company"
              />
            </div>

            {/* Location Picker */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Company Location
              </label>
              <MapContainer center={companyData.location} zoom={12} style={{ width: "100%", height: "400px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker
                  position={companyData.location}
                  setPosition={(newPosition) => setCompanyData({ ...companyData, location: newPosition })}
                  setAddress={(address) => setCompanyData({ ...companyData, address })}
                />
              </MapContainer>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Company Image
              </label>
              <div className="flex items-center gap-2">
                <span className="px-4 py-3 bg-gray-100 text-gray-700 rounded-l-md border border-r-0 border-gray-300">
                  Choose File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  name="image"
                  onChange={(e) => setCompanyData({ ...companyData, image: e.target.files[0] })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition duration-200 ease-in-out transform hover:-translate-y-0.5"
            >
              Update Company
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfileCompany;

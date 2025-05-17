// import React, { useEffect, useState } from "react";
// import Header from "../../layout/header";
// import axios from "axios";
// import { useLocation } from 'react-router-dom';
// import useBanCheck from '../admin/checkban';

// const HomePage = () => {
//   const BanPopup = useBanCheck();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const userData = params.get('user');

//     if (userData) {
//       try {
//         const decodedUser = JSON.parse(decodeURIComponent(userData));
//         localStorage.setItem("user", JSON.stringify(decodedUser));
//         setUser(decodedUser);
//       } catch (err) {
//         console.error("Error parsing user data:", err);
//       }
//     } else {
//       const storedUser = localStorage.getItem("user");
//       if (storedUser) {
//         setUser(JSON.parse(storedUser));
//       }
//     }
//   }, [location]);

//   if (!user) return <div>No user data available</div>;

//   return (
//     <>
//       {BanPopup}
//       <Header />
//       <div className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold mb-4">
//           Welcome, {user.firstName} {user.lastName}!
//         </h1>
//         <div className="bg-white shadow rounded-lg p-6">
//           <p className="mb-2"><strong>Email:</strong> {user.email}</p>
//           <p className="mb-2"><strong>Phone:</strong> {user.phoneNumber}</p>
//           <p className="mb-2"><strong>City:</strong> {user.city}</p>
//           <p className="mb-2"><strong>Status:</strong> {user.status}</p>
//           <p className="mb-2"><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
//           <p className="mb-2"><strong>Role:</strong> {user.role?.name}</p>
//           {user.message && (
//             <p className="mb-2"><strong>Message:</strong> {user.message}</p>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default HomePage;
import React, { useState, useEffect } from "react";
import Header from "../../layout/header";
import { useLocation } from 'react-router-dom';
import useBanCheck from '../admin/checkban';
import slideImage1 from '../img/1.jpg'
import slideImage2 from '../img/1.jpg'
import slideImage3 from '../img/1.jpg'

const HomePage = () => {
  const BanPopup = useBanCheck();
  const [user, setUser] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  // Carousel images and content
  const slides = [
    {
      image: slideImage1,
      title: 'Find Your Dream Job with Just a Few Clicks!',
      description: 'Explore thousands of job opportunities from top employers. Sign up now and take the first step toward your career goals!'
    },
    {
      image: slideImage2,
      title: 'The Perfect Job is Waiting for You!',
      description: 'Browse personalized job listings tailored to your skills and preferences. Start your journey to success today.'
    },
    {
      image: slideImage3,
      title: 'Elevate Your Career with JobFinder!',
      description: 'Connect with the best job opportunities in your industry. Let us help you achieve your career aspirations!'
    }
  ];

  // Change slide manually
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  // Auto slide change effect with 4s interval and smooth transition
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userData = params.get('user');

    if (userData) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem("user", JSON.stringify(decodedUser));
        setUser(decodedUser);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [location]);

  if (!user) return <div>No user data available</div>;

  return (
    <>
      {BanPopup}
      <Header />
      
      {/* Carousel Section */}
      <div className="relative overflow-hidden">
        {/* Carousel Slides */}
        <div className="carousel-inner transition-all duration-2000 ease-in-out">
          {slides.map((slide, index) => (
            <div key={index} className={`carousel-item ${index === currentSlide ? 'block' : 'hidden'}`}>
              <div className="relative bg-cover bg-center h-96" style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-4 py-32 text-center text-white relative">
                  <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-xl mb-4">{slide.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Navigation */}
        <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white p-2 rounded-full">
          &#10094;
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white p-2 rounded-full">
          &#10095;
        </button>
      </div>

      <div className="container mx-auto p-4">
        {/* User Information Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.firstName} {user.lastName}!</h1>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>Phone:</strong> {user.phoneNumber}</p>
          <p className="mb-2"><strong>City:</strong> {user.city}</p>
          <p className="mb-2"><strong>Status:</strong> {user.status}</p>
          <p className="mb-2"><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
          <p className="mb-2"><strong>Role:</strong> {user.role?.name}</p>
          {user.message && (
            <p className="mb-2"><strong>Message:</strong> {user.message}</p>
          )}
        </div>

        {/* Featured Jobs Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Featured Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Job Card */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <img src="https://via.placeholder.com/370x270" alt="Job" className="w-full h-48 object-cover mb-4 rounded" />
              <h4 className="text-xl font-semibold mb-2">Job Title</h4>
              <p className="text-gray-700 mb-2"><strong>Salary:</strong> 50,000 VND</p>
              <p className="text-gray-700 mb-2"><i className="fa fa-briefcase"></i> IT</p>
              <p className="text-gray-700 mb-2"><i className="fa fa-building"></i> ABC Corp</p>
              <p className="text-gray-500 text-sm"><i className="fa fa-calendar"></i> Posted on: 12/06/2024</p>
            </div>
            {/* Repeat the above card for more jobs */}
          </div>
        </div>

        {/* About Us Section */}
        <div className="mt-16 bg-gray-100 py-8">
          <div className="container mx-auto flex items-center justify-between">
            <div className="w-full md:w-1/2 px-4">
              <h2 className="text-2xl font-bold mb-4">About Us</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo, esse consequatur alias repellat in excepturi inventore ad asperiores tempora ipsa. Accusantium tenetur voluptate labore aperiam molestiae rerum excepturi minus in pariatur praesentium, corporis, aliquid dicta.</p>
            </div>
            <div className="w-full md:w-1/2 px-4">
              <img src="https://via.placeholder.com/570x350" alt="About Us" className="w-full h-auto object-cover rounded-lg" />
            </div>
          </div>
        </div>

        {/* Latest Blog Posts Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <img src="https://via.placeholder.com/370x270" alt="Blog 1" className="w-full h-48 object-cover mb-4 rounded" />
              <h4 className="text-xl font-semibold mb-2">Blog Post Title</h4>
              <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.</p>
            </div>
            {/* Repeat for more blog posts */}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-orange-500 text-white py-8 text-center">
          <h4 className="text-xl font-semibold mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</h4>
          <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque corporis amet elite author nulla.</p>
          <a href="/contact" className="bg-white text-orange-500 px-6 py-2 rounded-lg">Contact Us</a>
        </div>
      </div>
    </>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderEmployer from '../../layout/headeremp';
import toastr from 'toastr';
import useBanCheck from '../admin/checkban';

const BlogForm = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageFile: null // Change image to imageFile for file upload
  });
  const [isLoading, setIsLoading] = useState(false);
  const BanPopup = useBanCheck();

  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/employer/blogs/${blogId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setFormData({
        title: data.title,
        content: data.content,
        imageFile: null // Clear imageFile when editing blog
      });
    } catch (err) {
      toastr.error('Failed to load blog data');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData(); // Using FormData to handle file upload

    // Append form fields to FormData object
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);

    if (formData.imageFile) {
      formDataToSend.append('imageFile', formData.imageFile); // Append the image file
    }

    try {
      const url = blogId 
        ? `http://localhost:8080/employer/blogs/${blogId}`
        : 'http://localhost:8080/employer/blogs';
  
      const response = await fetch(url, {
        method: blogId ? 'PUT' : 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formDataToSend // Send FormData with the image
      });
  
      if (response.ok) {
        toastr.success(blogId ? 'Blog updated successfully' : 'Blog created successfully');
        navigate('/employer/blogs');
      } else {
        throw new Error('Failed to save blog');
      }
    } catch (err) {
      toastr.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      // Handle file input
      setFormData(prev => ({
        ...prev,
        imageFile: files[0] // Store the selected file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div>
        {BanPopup}
      <HeaderEmployer />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {blogId ? 'Edit Blog' : 'Create New Blog'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7808d0]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7808d0]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image (Optional)
            </label>
            <input
              type="file"  // File input for image
              name="imageFile"
              accept="image/*" // Only allow image files
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7808d0]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/employer/blogs')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#7808d0] text-white rounded-md hover:bg-[#5b0a9c] disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (blogId ? 'Update Blog' : 'Create Blog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderEmployer from '../../layout/headeremp';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useBanCheck from '../admin/checkban';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BanPopup = useBanCheck();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('http://localhost:8080/employer/blogs', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch blogs');
            }

            const data = await response.json();
            setBlogs(data.blogs || []);
        } catch (err) {
            setError(err.message);
            toastr.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/employer/blogs/${blogId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to delete blog');
            }

            setBlogs(blogs.filter(blog => blog.blogId !== blogId));
            toastr.success('Blog deleted successfully');
        } catch (err) {
            toastr.error('Failed to delete blog');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HeaderEmployer />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7808d0]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HeaderEmployer />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={fetchBlogs}
                        className="px-4 py-2 bg-[#7808d0] text-white rounded-lg hover:bg-[#5b0a9c]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>{BanPopup}
            <div className="min-h-screen bg-gray-50">
                <HeaderEmployer />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
                        <Link
                            to="/employer/create-blog"
                            className="bg-[#7808d0] hover:bg-[#5b0a9c] text-white px-4 py-2 rounded-lg transition duration-200"
                        >
                            Create New Blog
                        </Link>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 mt-8">
                            <img
                                src="/images/no-blogs.png"
                                alt="No blogs"
                                className="w-64 h-64 mb-6 opacity-75"
                            />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                No Blogs Yet
                            </h2>
                            <p className="text-gray-500 text-center mb-6 max-w-md">
                                Share your thoughts and experiences with the community. Create your first blog post today!
                            </p>
                            <Link
                                to="/create-blog"
                                className="bg-[#7808d0] hover:bg-[#5b0a9c] text-white px-6 py-3 rounded-lg transition duration-200 flex items-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Write Your First Blog
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <div key={blog.blogId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                                    {blog.image ? (
                                        <img
                                            src={`http://localhost:8080${blog.image}`} // Use the full URL for the image
                                            alt={blog.title}
                                            className="w-full h-64 object-cover rounded-lg mb-6"
                                            onError={(e) => {
                                                e.target.src = '/images/default-blog.png'; // Fallback to default image if the original one fails
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="/images/default-blog.png" // Default fallback image if no image is provided
                                            alt="Default Blog"
                                            className="w-full h-64 object-cover rounded-lg mb-6"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">
                                            {blog.title}
                                        </h2>
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {blog.content}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{new Date(blog.date).toLocaleDateString()}</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                    </svg>
                                                    {blog.nlike}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                    </svg>
                                                    {blog.ncmt}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                            <Link
                                                to={`/employer/blogs/${blog.blogId}`}
                                                className="text-blue-600 hover:text-blue-800 transition duration-200"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/employer/edit-blog/${blog.blogId}`}
                                                className="text-green-600 hover:text-green-800 transition duration-200"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(blog.blogId)}
                                                className="text-red-600 hover:text-red-800 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogList;
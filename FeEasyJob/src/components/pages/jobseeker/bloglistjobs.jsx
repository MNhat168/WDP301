import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const JobSeekerBlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const BanPopup = useBanCheck();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('http://localhost:8080/blogs', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch blogs');
            const data = await response.json();
            setBlogs(data.blogs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || blog.category === selectedCategory)
    );

    const topBlogs = [...blogs]
        .sort((a, b) => b.nLike - a.nLike)
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7808d0]"></div>
                </div>
            </div>
        );
    }

    return (
        <>{BanPopup}
            <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Filters */}
                    <div className="col-span-12 lg:col-span-3 h-[calc(100vh-80px)] sticky top-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Filters</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all"
                                        placeholder="Search blogs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="space-y-6">
                            {filteredBlogs.map((blog) => (
                                <article
                                    key={blog.blogId}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition-all duration-300"
                                >
                                    <Link to={`/blogs/${blog.blogId}`} className="block p-6">
                                        {/* Author Info */}
                                        <div className="flex items-center mb-6">
                                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-sky-100">
                                                <img
                                                    src={`http://localhost:8080${blog.companyUrl}`}
                                                    alt={blog.title}
                                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                                    onError={(e) => {
                                                        e.target.src = '/images/default-blog.png'; // Fallback to default image if the original one fails
                                                    }}
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">
                                                    {blog.companyName ? `${blog.companyName}` : 'Anonymous'}
                                                </p>
                                                <p className="text-sm text-gray-500">{formatDate(blog.date)}</p>
                                            </div>
                                        </div>

                                        {/* Blog Content */}
                                        <div className="space-y-4">
                                            {/* Blog Image */}
                                            {blog.image ? (
                                                <img
                                                    src={`http://localhost:8080${blog.image}`}
                                                    alt={blog.title}
                                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                                    onError={(e) => {
                                                        e.target.src = '/images/default-blog.png'; // Fallback to default image if the original one fails
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src="/images/default-blog.png"
                                                    alt="Default Blog"
                                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                                />
                                            )}

                                            {/* Title */}
                                            <h2 className="text-xl font-semibold text-gray-900 mb-3">{blog.title}</h2>

                                            {/* Content */}
                                            <p className="text-gray-600 line-clamp-3 mb-4 text-sm leading-relaxed">
                                                {blog.content}
                                            </p>
                                        </div>

                                        {/* Engagement Stats */}
                                        <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-100">
                                            <span className="flex items-center text-gray-500 text-sm">
                                                <svg
                                                    className="w-5 h-5 mr-2 text-sky-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                                {blog.nlike} Likes
                                            </span>
                                            <span className="flex items-center text-gray-500 text-sm">
                                                <svg
                                                    className="w-5 h-5 mr-2 text-sky-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                    />
                                                </svg>
                                                {blog.ncmt} Comments
                                            </span>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                    {/* Right Sidebar - Top Blogs */}
                    <div className="col-span-12 lg:col-span-3 h-[calc(100vh-80px)] sticky top-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Top Blogs</h2>
                            <div className="space-y-4">
                                {topBlogs
                                    .map((blog) => (
                                        <Link key={blog.blogId} to={`/blogs/${blog.blogId}`} className="block group">
                                            <div className="flex items-start space-x-3 p-2 rounded-xl hover:bg-white/50 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <div className="aspect-square w-16 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={`http://localhost:8080${blog.image}`}
                                                            alt={blog.title}
                                                            className="w-full h-64 object-cover rounded-lg mb-6"
                                                            onError={(e) => {
                                                                e.target.src = '/images/default-blog.png'; // Fallback to default image if the original one fails
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {blog.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {blog.nlike} likes • {blog.ncmt} comments
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JobSeekerBlogList;
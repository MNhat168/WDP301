import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../layout/header';
import toastr from 'toastr';
import useBanCheck from '../admin/checkban';

const JobSeekerBlogDetail = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const BanPopup = useBanCheck();

    const fetchBlogDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/blogs/${blogId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Fetched blog data:', data); // Debug log
            setBlog(data);
            setIsLiked(data.likedByCurrentUser);
        } catch (err) {
            console.error('Failed to load blog details:', err);
            toastr.error('Failed to load blog details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`http://localhost:8080/blogs/${blogId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to toggle like');
            }

            const data = await response.json();
            setIsLiked(data.liked);
            setBlog(prev => ({
                ...prev,
                nlike: data.likeCount
            }));
        } catch (err) {
            console.error('Failed to like blog:', err);
            toastr.error('Failed to like blog');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/blogs/${blogId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ commentText: newComment })
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            // Refresh blog details to show new comment
            await fetchBlogDetails();
            setNewComment(''); // Clear comment input
            toastr.success('Comment posted successfully');
            // Notify admin about the new comment
            await notifyAdmin(`New comment on blog ${blog.title}: ${newComment}`);
        } catch (err) {
            console.error('Failed to post comment:', err);
            toastr.error('Failed to post comment');
        }
    };

    const notifyAdmin = async (message) => {
        try {
            const response = await fetch(`http://localhost:8080/notification/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to notify admin');
            }

            toastr.success('Admin notified successfully');
        } catch (err) {
            console.error('Failed to notify admin:', err);
            toastr.error('Failed to notify admin');
        }
    };

    const handleReport = async () => {
        try {
            const response = await fetch(`http://localhost:8080/blogs/${blogId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ reason: reportReason })
            });
            if (response.ok) {
                toastr.success('Report submitted successfully');
                setShowReportModal(false);
                setReportReason('');
                // Notify admin about the report
                await notifyAdmin(`Blog ${blog.title} reported: ${reportReason}`);
            }
        } catch (err) {
            toastr.error('Failed to submit report');
        }
    };

    useEffect(() => {
        fetchBlogDetails();
    }, [blogId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-50">
                <Header />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-50">
            {BanPopup}
            <Header />
            <div className="container mx-auto px-4 py-8">
                {blog && (
                    <div className="flex gap-8">
                        {/* Left Column - Blog Content */}
                        <div className="w-2/3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-8">
                                {blog.image && (
                                    <div className="rounded-xl overflow-hidden mb-8 bg-gray-100">
                                        <img
                                            src={`http://localhost:8080${blog.image}`}
                                            alt={blog.title}
                                            className="w-full h-[400px] object-cover"
                                        />
                                    </div>
                                )}
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Report
                                    </button>
                                </div>
                                <div className="prose max-w-none mb-8 text-gray-600 leading-relaxed">
                                    {blog.content}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Likes and Comments */}
                        <div className="w-1/3 space-y-6">
                            {/* Likes Section */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-xl 
                                        ${isLiked 
                                            ? 'text-sky-600 bg-sky-50' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                        } transition-all duration-200`}
                                >
                                    <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                        />
                                    </svg>
                                    <span className="font-medium">{blog.nlike} Likes</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                                    Comments ({blog.ncmt})
                                </h2>
                                <form onSubmit={handleComment} className="mb-6">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full p-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all"
                                        placeholder="Write a comment..."
                                        rows="3"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="mt-3 w-full px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors duration-200"
                                    >
                                        Post Comment
                                    </button>
                                </form>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {blog?.cmt?.map((comment) => (
                                        <div key={comment.commentId} 
                                            className="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {comment.userName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(comment.commentDate).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {comment.commentText}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Report Blog</h2>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full p-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all"
                            rows="4"
                            placeholder="Please describe why you're reporting this blog..."
                            required
                        ></textarea>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerBlogDetail;
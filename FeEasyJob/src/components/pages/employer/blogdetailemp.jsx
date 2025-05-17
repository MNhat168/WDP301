import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderEmployer from '../../layout/headeremp';
import useBanCheck from '../admin/checkban';

const BlogDetail = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const BanPopup = useBanCheck();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBlogDetails();
    }, [blogId]);

    const fetchBlogDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/employer/blogs/${blogId}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch blog details');
            }
            const data = await response.json();
            console.log('Fetched blog data:', data); // Keep this debug log
            setBlog(data);
            // Update this line to use data.cmt directly
            setComments(data.cmt || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    //   const handleComment = async (e) => {
    //     e.preventDefault();
    //     try {
    //       const response = await fetch(`http://localhost:8080/employer/detailblog/${blogId}`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         credentials: 'include',
    //         body: JSON.stringify({ commentText: newComment })
    //       });

    //       if (response.ok) {
    //         setNewComment('');
    //         fetchBlogDetails(); // Refresh comments
    //       }
    //     } catch (err) {
    //       console.error('Error posting comment:', err);
    //     }
    //   };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!blog) return <div>Blog not found</div>;

    return (
        <div>
            {BanPopup}
            <HeaderEmployer />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
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


                    <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

                    <div className="flex items-center text-gray-600 mb-6">
                        <span>{new Date(blog.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{blog.nlike} likes</span>
                        <span className="mx-2">•</span>
                        <span>{blog.ncmt} comments</span>
                    </div>

                    <div className="prose max-w-none mb-8">
                        {blog.content}
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Comments ({blog.ncmt})</h2>
                        <div className="space-y-4">
                            {comments && comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.commentId} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{comment.userName}</span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(comment.commentDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p>{comment.commentText}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No comments yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
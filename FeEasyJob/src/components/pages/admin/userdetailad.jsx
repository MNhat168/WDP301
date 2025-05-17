// src/components/UserDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const UserDetail = () => {
    const { userId } = useParams(); // Get userId from URL parameters
    const [user, setUser] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [likesComments, setLikesComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/admin/users/check-status/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchAdditionalData = async () => {
            try {
                const jobsResponse = await fetch(`http://localhost:8080/admin/users/${userId}/saved-jobs`);
                const commentsResponse = await fetch(`http://localhost:8080/admin/users/${userId}/likes-comments`);

                if (!jobsResponse.ok || !commentsResponse.ok) {
                    throw new Error('Failed to fetch additional data');
                }

                const jobsData = await jobsResponse.json();
                const commentsData = await commentsResponse.json();

                setSavedJobs(jobsData);
                setLikesComments(commentsData);
            } catch (err) {
                setError(err.message);
            }
        };

        setLoading(true);
        fetchUserDetails().then(() => {
            fetchAdditionalData();
            setLoading(false);
        });
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="user-detail p-4">
            <h1 className="text-2xl font-bold">User Profile</h1>
            <h2 className="text-xl">{user.name}</h2>
            <p>Status: {user.status}</p>
            <h3 className="text-lg font-semibold">Saved Jobs</h3>
            <ul>
                {savedJobs.map(job => (
                    <li key={job.jobId}>{job.title}</li>
                ))}
            </ul>
            <h3 className="text-lg font-semibold">Likes/Comments</h3>
            <ul>
                {likesComments.map(comment => (
                    <li key={comment.id}>{comment.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserDetail;
// src/pages/Profile/Profile.js
import React, { useEffect } from 'react';
import '../pages.css';
import { useUserAuth } from "../../context/UserAuthContext";
import MainProfile from './MainProfile/MainProfile';

function Profile() {
    const { user, followers, setFollowers } = useUserAuth();

    useEffect(() => {
        if (user) {
            // Fetch followers logic here, mock data for example
            const fetchFollowers = async () => {
                // Replace with actual fetch call
                const fetchedFollowers = await Promise.resolve([/* array of followers */]);
                setFollowers(fetchedFollowers);
            };
            fetchFollowers();
        }
    }, [user, setFollowers]);

    return (
        <div className='profilePage'>
            <MainProfile user={user} />
            <h2>Followers</h2>
        <ul>
            {followers.map(follower => (
                <li key={follower.id}>{follower.name}</li>
            ))}
        </ul>
        </div>
    );
}

export default Profile;

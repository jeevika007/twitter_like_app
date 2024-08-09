// src/pages/Feed/Feed.js
import React, { useEffect, useState } from "react";
import Post from "./Post/Post";
import "./Feed.css";
import TweetBox from "./TweetBox/TweetBox";
import { useUserAuth } from "../../context/UserAuthContext";

function Feed() {
    const [posts, setPosts] = useState([]);
    const { canPost, incrementPostCount } = useUserAuth();

    useEffect(() => {
        fetch('https://pacific-peak-30751.herokuapp.com/post')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
            });
    }, []);

    const handlePostTweet = (tweet) => {
        if (canPost()) {
            // Post the tweet logic here, for example:
            // fetch('https://pacific-peak-30751.herokuapp.com/post', { method: 'POST', body: JSON.stringify({ content: tweet }) });
            incrementPostCount();
        } else {
            alert("You cannot post a tweet at this time.");
        }
    };

    return (
        <div className="feed">
            <div className="feed__header">
                <h2>Home</h2>
            </div>
            <TweetBox onPostTweet={handlePostTweet} />
            {
                posts.map(p => <Post key={p._id} p={p} />)
            }
        </div>
    );
}

export default Feed;

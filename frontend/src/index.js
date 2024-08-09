// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for createRoot
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Correct usage of createRoot
root.render(
  <Router>
    <App />
  </Router>
);

// Request notification permission when the app loads
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// Function to show a notification
function showNotification(tweet) {
  if (Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') === 'true') {
    new Notification('New Tweet', {
      body: tweet,
    });
  }
}

// Function to check for keywords and show notifications
function checkTweet(tweet) {
  if (tweet.includes('cricket') || tweet.includes('science')) {
    showNotification(tweet);
  }
}

// Simulate receiving new tweets
const tweets = [
  'I love cricket!',
  'Science is amazing.',
  'Just had a great lunch.',
  'Cricket and science are my favorite subjects.'
];

tweets.forEach(tweet => {
  checkTweet(tweet);
});

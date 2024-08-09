// src/pages/Notifications/Notifications.js
import React, { useEffect, useState } from 'react';
import '../pages.css';

function Notifications() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        setNotificationsEnabled(enabled);
    }, []);

    const handleToggle = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        localStorage.setItem('notificationsEnabled', newValue);
    };

    return (
        <div className='page'>
            <h2 className='pageTitle'>Welcome to Notifications page</h2>
            <label>
                <input 
                    type="checkbox" 
                    checked={notificationsEnabled} 
                    onChange={handleToggle} 
                /> 
                Enable Notifications
            </label>
        </div>
    );
}

export default Notifications;

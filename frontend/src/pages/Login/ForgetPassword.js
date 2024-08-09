// src/pages/Login/ForgotPassword.js

import React, { useState } from "react";

function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailOrPhone, phone: emailOrPhone }),
    });

    if (response.ok) {
        setMessage('A new password has been sent to your email or phone number');
    } else {
        const error = await response.text();
        setMessage(error);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email-phone">Email or Phone:</label>
        <input
          type="text"
          id="email-phone"
          name="email-phone"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />
        <button type="submit">Request New Password</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default ForgotPassword;
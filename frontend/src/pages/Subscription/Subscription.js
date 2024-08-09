import React, { useState } from 'react';
import axios from 'axios';

const Subscription = () => {
  const [plan, setPlan] = useState('free');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post('/create-order', { plan });

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: 'Your App Name',
        description: `Subscribe to ${plan} plan`,
        order_id: order.id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          try {
            await axios.post('/verify-payment', {
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              signature: razorpay_signature,
              plan,
              email,
            });

            alert('Payment successful and email sent');
          } catch (error) {
            setErrorMessage('Payment verification failed');
          }
        },
        prefill: {
          email: email,
        },
        theme: {
          color: '#F37254'
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setErrorMessage('Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setErrorMessage('Payments are allowed only between 10-11 AM IST');
      } else {
        setErrorMessage('Payment initialization failed. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2>Choose a Subscription Plan</h2>
      <select value={plan} onChange={(e) => setPlan(e.target.value)}>
        <option value="free">Free - 1 Tweet</option>
        <option value="bronze">Bronze - ₹100/month - 3 Tweets</option>
        <option value="silver">Silver - ₹300/month - 5 Tweets</option>
        <option value="gold">Gold - ₹1000/month - Unlimited Tweets</option>
      </select>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button onClick={handlePayment}>Subscribe</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default Subscription;

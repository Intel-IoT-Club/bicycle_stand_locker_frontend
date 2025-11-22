import React from 'react';

export default function RazorpayButton({ order, onSuccess, onError }) {
  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: "Smart Bicycle Rental",
      description: "Wallet Recharge",
      order_id: order.id,
      handler: function (response) {
        console.log('Payment successful:', response);
        onSuccess?.(response);
      },
      prefill: {
        name: "Keerthi Vasan",
        email: "a.keerthivasan7676@gmail.com",
        contact: "6374410xxx",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
        }
      }
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Failed to initialize Razorpay:', err);
      onError?.(err);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
    >
      Pay Now
    </button>
  );
}

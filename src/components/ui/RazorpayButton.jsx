const options = {
  key: "rzp_test_RFY2rpzcInVgE8", // <-- Replace this with YOUR Razorpay Key ID
  amount: order.amount,
  currency: order.currency,
  name: "Smart Bicycle Rental",
  description: "Wallet Recharge",
  order_id: order.id,
  handler: function (response) {
    // success handler
  },
  prefill: {
    name: "Keerthi Vasan",
    email: "a.keerthivasan7676@gmail.com",
    contact: "6374410xxx",
  },
  theme: {
    color: "#3399cc",
  },
};

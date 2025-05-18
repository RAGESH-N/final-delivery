const mongoose = require('mongoose');

const OrderHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  total: { type: Number, required: true },
  cartItems: { type: Array, required: true },
  orderTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('order-history', OrderHistorySchema);
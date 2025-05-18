const mongoose = require('mongoose');

const RestaurantOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  total: { type: Number, required: true },
  cartItems: [{
    dishName: String,
    price: Number,
    quantity: Number
  }],
  orderTime: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' } // Pending, Accepted, Rejected
});

module.exports = mongoose.model('RestaurantOrder', RestaurantOrderSchema);
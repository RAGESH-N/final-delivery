const express = require('express');
const router = express.Router();
const RestaurantOrder = require('../models/RestaurantOrder');

// Create a new restaurant order (called from Pay Now)
router.post('/', async (req, res) => {
  try {
    const order = new RestaurantOrder(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for a restaurant
router.get('/:restaurantName', async (req, res) => {
  try {
    const orders = await RestaurantOrder.find({ restaurantName: req.params.restaurantName }).sort({orderTime: -1});
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for a user (Order History)
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await RestaurantOrder.find({ userId: req.params.userId }).sort({ orderTime: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (Accept/Reject)
router.patch('/:orderId/status', async (req, res) => {
  try {
    await RestaurantOrder.findByIdAndUpdate(req.params.orderId, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
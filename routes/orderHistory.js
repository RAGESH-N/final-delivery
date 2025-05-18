const express = require('express');
const router = express.Router();
const OrderHistory = require('../models/OrderHistory');

// Save new order to order-history
router.post('/', async (req, res) => {
  try {
    const { userId, total, cartItems, orderTime } = req.body;
    const order = new OrderHistory({ userId, total, cartItems, orderTime });
    await order.save();
    res.status(201).json({ message: 'Order saved!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderHistory.find({ userId }).sort({ orderTime: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
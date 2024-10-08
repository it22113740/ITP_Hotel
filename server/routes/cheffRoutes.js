const express = require('express');
const router = express.Router();
const CheffMeal = require('../models/cheffmeal'); // Ensure this path is correct
const EmailService = require('../utils/emailService'); // Ensure this path is correct

// Route to get all orders
router.get('/getAllOrders', async (req, res) => {
    try {
        const orders = await CheffMeal.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Route to add an order
router.post('/addOrder', async (req, res) => {
    const { foodImageUrl, foodName, foodQuantity } = req.body;
    try {
        const newOrder = new CheffMeal({ foodImageUrl, foodName, foodQuantity });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error adding order' });
    }
});

// Route to delete an order
router.delete('/deleteOrder/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await CheffMeal.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete order' });
    }
});

// Route to finish an order
router.post('/finishOrder/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await CheffMeal.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Send email notification
        await EmailService.sendFoodReminderEmail("sivanesangabilan2001@gmail.com", {
            eventName: order.foodName,
            eventLink: order.foodImageUrl // Assuming this links to some event or image
        });

        res.status(200).json({ message: 'Order finished and email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error finishing order' });
    }
});

module.exports = router;

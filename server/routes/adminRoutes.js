const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getSalesHistory, updateProduct } = require('../controllers/adminController');

router.get('/sales', protect, isAdmin, getSalesHistory);
router.put('/products/:id', protect, isAdmin, updateProduct);

module.exports = router;
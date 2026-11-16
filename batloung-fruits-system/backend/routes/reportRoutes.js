const express = require('express');
const router = express.Router();
const {
  availableStockReport,
  salesByFruit,
  salesByBoxSize,
  salesByVendor,
  purchasesByProvince,
  pendingOrders,
  completedOrders,
  salesByDate
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('administrator'));
// Reports accessible by Admin (and optionally Sales for some)
router.get('/available-stock', availableStockReport);
router.get('/sales-by-fruit', salesByFruit);
router.get('/sales-by-box-size', salesByBoxSize);
router.get('/sales-by-vendor', salesByVendor);
router.get('/purchases-by-province', purchasesByProvince);
router.get('/pending-orders', pendingOrders);
router.get('/completed-orders', completedOrders);
router.get('/sales-by-date', salesByDate);

module.exports = router;

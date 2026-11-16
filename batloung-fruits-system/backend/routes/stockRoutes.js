const express = require('express');
const router = express.Router();
const {
  getStock, recordStock, updateStock, getPurchases
} = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/purchases', getPurchases);

router.route('/')
  .get(getStock)
  .post(authorize('administrator'), recordStock);

router.route('/:id')
  .put(authorize('administrator'), updateStock);

module.exports = router;

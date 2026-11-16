const express = require('express');
const router = express.Router();
const {
  getVendors, getVendor, createVendor, updateVendor, deleteVendor
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getVendors)
  .post(createVendor); // Both Admin and Sales can register vendors

router.route('/:id')
  .get(getVendor)
  .put(updateVendor)
  .delete(authorize('administrator'), deleteVendor);

module.exports = router;

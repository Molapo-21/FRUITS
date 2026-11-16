const pool = require('../config/db');

// Generate unique vendor ID
const generateVendorId = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM street_vendors');
  const count = rows[0].count + 1;
  return `VEN${String(count).padStart(4, '0')}`;
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res, next) => {
  try {
    const { search, status, location } = req.query;
    let query = 'SELECT * FROM street_vendors WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (vendor_name LIKE ? OR business_name LIKE ? OR vendor_id LIKE ? OR telephone LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' ORDER BY registration_date DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
const getVendor = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM street_vendors WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Register vendor
// @route   POST /api/vendors
// @access  Private (Admin & Sales)
const createVendor = async (req, res, next) => {
  try {
    const { vendor_name, business_name, telephone, location, latitude, longitude, registration_date, status } = req.body;

    if (!vendor_name || !telephone || !location) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name, telephone and location are required'
      });
    }

    const vendor_id = await generateVendorId();
    const regDate = registration_date || new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      `INSERT INTO street_vendors (vendor_id, vendor_name, business_name, telephone, location, latitude, longitude, registration_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, vendor_name.trim(), business_name?.trim() || null, telephone.trim(), 
       location.trim(), latitude === '' || latitude == null ? null : Number(latitude), longitude === '' || longitude == null ? null : Number(longitude), regDate, status || 'Active']
    );

    const [newVendor] = await pool.query('SELECT * FROM street_vendors WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Street vendor registered successfully',
      data: newVendor[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = async (req, res, next) => {
  try {
    const { vendor_name, business_name, telephone, location, latitude, longitude, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM street_vendors WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    await pool.query(
      `UPDATE street_vendors SET 
        vendor_name = COALESCE(?, vendor_name),
        business_name = COALESCE(?, business_name),
        telephone = COALESCE(?, telephone),
        location = COALESCE(?, location),
        latitude = ?,
        longitude = ?,
        status = COALESCE(?, status)
       WHERE id = ?`,
      [vendor_name?.trim(), business_name?.trim(), telephone?.trim(), 
       location?.trim(), latitude === undefined ? existing[0].latitude : (latitude === '' || latitude === null ? null : Number(latitude)),
       longitude === undefined ? existing[0].longitude : (longitude === '' || longitude === null ? null : Number(longitude)), status, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM street_vendors WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
const deleteVendor = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM street_vendors WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Soft delete via status
    await pool.query('UPDATE street_vendors SET status = ? WHERE id = ?', ['Inactive', req.params.id]);

    res.json({
      success: true,
      message: 'Vendor deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
};

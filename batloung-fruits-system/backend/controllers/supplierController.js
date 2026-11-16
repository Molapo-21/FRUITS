const pool = require('../config/db');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const { search, province, is_active } = req.query;
    let query = `
      SELECT s.*, p.name AS province_name 
      FROM suppliers s 
      JOIN provinces p ON s.province_id = p.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (s.name LIKE ? OR s.contact_person LIKE ? OR s.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (province) {
      query += ' AND p.name = ?';
      params.push(province);
    }

    if (is_active !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY s.name ASC';

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

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, p.name AS province_name 
       FROM suppliers s 
       JOIN provinces p ON s.province_id = p.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
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

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res, next) => {
  try {
    const { name, province_id, contact_person, telephone, email, physical_address } = req.body;

    if (!name || !province_id || !contact_person || !telephone || !physical_address) {
      return res.status(400).json({
        success: false,
        message: 'Name, province, contact person, telephone and physical address are required'
      });
    }

    // Validate province exists
    const [prov] = await pool.query('SELECT id FROM provinces WHERE id = ?', [province_id]);
    if (prov.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid province selected'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers (name, province_id, contact_person, telephone, email, physical_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), province_id, contact_person.trim(), telephone.trim(), email?.trim() || null, physical_address.trim()]
    );

    const [newSupplier] = await pool.query(
      `SELECT s.*, p.name AS province_name 
       FROM suppliers s JOIN provinces p ON s.province_id = p.id 
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = async (req, res, next) => {
  try {
    const { name, province_id, contact_person, telephone, email, physical_address, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (province_id) {
      const [prov] = await pool.query('SELECT id FROM provinces WHERE id = ?', [province_id]);
      if (prov.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid province selected'
        });
      }
    }

    await pool.query(
      `UPDATE suppliers SET 
        name = COALESCE(?, name),
        province_id = COALESCE(?, province_id),
        contact_person = COALESCE(?, contact_person),
        telephone = COALESCE(?, telephone),
        email = COALESCE(?, email),
        physical_address = COALESCE(?, physical_address),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name?.trim(), province_id, contact_person?.trim(), telephone?.trim(), 
       email?.trim(), physical_address?.trim(), is_active, req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT s.*, p.name AS province_name 
       FROM suppliers s JOIN provinces p ON s.province_id = p.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Soft delete
    await pool.query('UPDATE suppliers SET is_active = FALSE WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Supplier deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all provinces
// @route   GET /api/suppliers/provinces/list
// @access  Private
const getProvinces = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM provinces ORDER BY name ASC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getProvinces
};

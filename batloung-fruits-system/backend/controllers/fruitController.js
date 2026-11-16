const pool = require('../config/db');

// @desc    Get all fruits
// @route   GET /api/fruits
// @access  Private
const getFruits = async (req, res, next) => {
  try {
    const { search, is_active } = req.query;
    let query = 'SELECT * FROM fruits WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

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

// @desc    Get single fruit
// @route   GET /api/fruits/:id
// @access  Private
const getFruit = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fruits WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
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

// @desc    Create fruit
// @route   POST /api/fruits
// @access  Private/Admin
const createFruit = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Fruit name is required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO fruits (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    const [newFruit] = await pool.query('SELECT * FROM fruits WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Fruit created successfully',
      data: newFruit[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fruit
// @route   PUT /api/fruits/:id
// @access  Private/Admin
const updateFruit = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM fruits WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
      });
    }

    await pool.query(
      'UPDATE fruits SET name = COALESCE(?, name), description = COALESCE(?, description), is_active = COALESCE(?, is_active) WHERE id = ?',
      [name?.trim(), description, is_active, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM fruits WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Fruit updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Deactivate fruit
// @route   DELETE /api/fruits/:id
// @access  Private/Admin
const deleteFruit = async (req, res, next) => {
  try {
    const [existing] = await pool.query('SELECT * FROM fruits WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fruit not found'
      });
    }

    // Soft delete (deactivate) to maintain data integrity
    await pool.query('UPDATE fruits SET is_active = FALSE WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Fruit deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFruits,
  getFruit,
  createFruit,
  updateFruit,
  deleteFruit
};

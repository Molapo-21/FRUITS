const pool = require('../config/db');

// @desc    Get all stock
// @route   GET /api/stock
// @access  Private
const getStock = async (req, res, next) => {
  try {
    const { search, low_stock } = req.query;
    let query = `
      SELECT s.*, p.selling_price, f.name AS fruit_name, bs.name AS box_size_name,
             CONCAT(f.name, ' - ', bs.name) AS product_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN fruits f ON p.fruit_id = f.id
      JOIN box_sizes bs ON p.box_size_id = bs.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (search) {
      query += ' AND (f.name LIKE ? OR bs.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (low_stock === 'true') {
      query += ' AND s.quantity_available < 10';
    }

    query += ' ORDER BY f.name, bs.name';

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

// @desc    Record incoming stock (Purchase)
// @route   POST /api/stock
// @access  Private/Admin
const recordStock = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { supplier_id, product_id, quantity, purchase_price, purchase_date, notes } = req.body;

    if (!supplier_id || !product_id || !quantity || quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Supplier, product and quantity (>0) are required'
      });
    }

    // Validate supplier
    const [suppliers] = await connection.query(
      'SELECT id FROM suppliers WHERE id = ? AND is_active = TRUE',
      [supplier_id]
    );
    if (suppliers.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Supplier not found or inactive'
      });
    }

    // Validate product
    const [products] = await connection.query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );
    if (products.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Record purchase
    await connection.query(
      `INSERT INTO purchases (supplier_id, product_id, quantity, purchase_price, purchase_date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, product_id, quantity, purchase_price || 0, 
       purchase_date || new Date().toISOString().split('T')[0], notes || null, req.user?.id || null]
    );

    // Update stock (automatically increase available stock)
    await connection.query(
      'UPDATE stock SET quantity_available = quantity_available + ? WHERE product_id = ?',
      [quantity, product_id]
    );

    await connection.commit();

    // Get updated stock
    const [stock] = await pool.query(
      `SELECT s.*, f.name AS fruit_name, bs.name AS box_size_name
       FROM stock s
       JOIN products p ON s.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       WHERE s.product_id = ?`,
      [product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Stock recorded and inventory updated successfully',
      data: stock[0]
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Update stock (manual adjustment - Admin only)
// @route   PUT /api/stock/:id
// @access  Private/Admin
const updateStock = async (req, res, next) => {
  try {
    const { quantity_available } = req.body;

    if (quantity_available === undefined || quantity_available < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity_available (>= 0) is required'
      });
    }

    const [existing] = await pool.query('SELECT * FROM stock WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    await pool.query(
      'UPDATE stock SET quantity_available = ? WHERE id = ?',
      [quantity_available, req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT s.*, f.name AS fruit_name, bs.name AS box_size_name
       FROM stock s
       JOIN products p ON s.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase history
// @route   GET /api/stock/purchases
// @access  Private
const getPurchases = async (req, res, next) => {
  try {
    const { supplier_id, province, from_date, to_date } = req.query;
    let query = `
      SELECT pu.*, s.name AS supplier_name, p.name AS province_name,
             f.name AS fruit_name, bs.name AS box_size_name
      FROM purchases pu
      JOIN suppliers s ON pu.supplier_id = s.id
      JOIN provinces p ON s.province_id = p.id
      JOIN products pr ON pu.product_id = pr.id
      JOIN fruits f ON pr.fruit_id = f.id
      JOIN box_sizes bs ON pr.box_size_id = bs.id
      WHERE 1=1
    `;
    const params = [];

    if (supplier_id) {
      query += ' AND pu.supplier_id = ?';
      params.push(supplier_id);
    }

    if (province) {
      query += ' AND p.name = ?';
      params.push(province);
    }

    if (from_date) {
      query += ' AND pu.purchase_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND pu.purchase_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY pu.purchase_date DESC';

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

module.exports = {
  getStock,
  recordStock,
  updateStock,
  getPurchases
};

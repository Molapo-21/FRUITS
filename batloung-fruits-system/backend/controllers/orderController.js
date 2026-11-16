const pool = require('../config/db');

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?',
    [`${prefix}%`]
  );
  const count = rows[0].count + 1;
  return `${prefix}${String(count).padStart(4, '0')}`;
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { search, status, vendor_id, from_date, to_date } = req.query;
    let query = `
      SELECT o.*, sv.vendor_name, sv.business_name, sv.vendor_id AS vendor_code
      FROM orders o
      JOIN street_vendors sv ON o.vendor_id = sv.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (o.order_number LIKE ? OR sv.vendor_name LIKE ? OR sv.business_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (vendor_id) {
      query += ' AND o.vendor_id = ?';
      params.push(vendor_id);
    }

    if (from_date) {
      query += ' AND o.order_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND o.order_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY o.created_at DESC';

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

// @desc    Get single order with items
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, sv.vendor_name, sv.business_name, sv.vendor_id AS vendor_code, sv.telephone AS vendor_telephone
       FROM orders o
       JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const [items] = await pool.query(
      `SELECT oi.*, f.name AS fruit_name, bs.name AS box_size_name, p.selling_price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...orders[0],
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private (Admin & Sales)
const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { vendor_id, order_date, items, notes } = req.body;

    // Validate required fields
    if (!vendor_id || !items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vendor and at least one order item are required'
      });
    }

    // Validate vendor exists and is active
    const [vendors] = await connection.query(
      'SELECT * FROM street_vendors WHERE id = ? AND status = ?',
      [vendor_id, 'Active']
    );
    if (vendors.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vendor not found or is not active'
      });
    }

    // Validate each item and check stock
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid product_id and quantity greater than zero'
        });
      }

      // Get product and current stock
      const [products] = await connection.query(
        `SELECT p.*, s.quantity_available, f.name AS fruit_name, bs.name AS box_size
         FROM products p
         JOIN stock s ON p.id = s.product_id
         JOIN fruits f ON p.fruit_id = f.id
         JOIN box_sizes bs ON p.box_size_id = bs.id
         WHERE p.id = ? AND p.is_active = TRUE`,
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product ID ${item.product_id} not found or inactive`
        });
      }

      const product = products[0];

      // BUSINESS RULE: Cannot order more than available stock
      if (item.quantity > product.quantity_available) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.fruit_name} (${product.box_size}). Available: ${product.quantity_available}, Requested: ${item.quantity}`
        });
      }

      const unitPrice = product.selling_price;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal
      });
    }

    // Create order
    const orderNumber = await generateOrderNumber();
    const orderDate = order_date || new Date().toISOString().split('T')[0];

    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, vendor_id, order_date, total_amount, status, notes, created_by)
       VALUES (?, ?, ?, ?, 'Pending', ?, ?)`,
      [orderNumber, vendor_id, orderDate, totalAmount, notes || null, req.user?.id || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await connection.commit();

    // Fetch complete order
    const [newOrder] = await pool.query(
      `SELECT o.*, sv.vendor_name, sv.business_name
       FROM orders o JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.id = ?`,
      [orderId]
    );

    const [orderItems] = await pool.query(
      `SELECT oi.*, f.name AS fruit_name, bs.name AS box_size_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...newOrder[0],
        items: orderItems
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Update order (mainly status)
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { status, notes } = req.body;
    const orderId = req.params.id;

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const currentOrder = orders[0];
    const previousStatus = currentOrder.status;

    // Valid statuses
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Ready for Collection/Delivery', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // BUSINESS RULE: When order is Completed, reduce stock
    // BUSINESS RULE: Cancelled orders should NOT reduce stock
    if (status === 'Completed' && previousStatus !== 'Completed') {
      // Get order items
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );

      for (const item of items) {
        // Check stock again
        const [stock] = await connection.query(
          'SELECT quantity_available FROM stock WHERE product_id = ?',
          [item.product_id]
        );

        if (stock.length === 0 || stock[0].quantity_available < item.quantity) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock to complete order for product ID ${item.product_id}`
          });
        }

        // Reduce stock
        await connection.query(
          'UPDATE stock SET quantity_available = quantity_available - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // If changing FROM Completed to something else, we should restore stock (optional but good practice)
    // Assignment says cancelled should not reduce, so we only reduce on Completed.

    // Update order
    await connection.query(
      `UPDATE orders SET 
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status, notes, orderId]
    );

    await connection.commit();

    const [updated] = await pool.query(
      `SELECT o.*, sv.vendor_name, sv.business_name
       FROM orders o JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.id = ?`,
      [orderId]
    );

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Delete order (only if Pending or Cancelled)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['Pending', 'Cancelled'].includes(orders[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Only Pending or Cancelled orders can be deleted'
      });
    }

    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]); // Cascades to order_items

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
};

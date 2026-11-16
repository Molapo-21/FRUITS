const pool = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // Total fruits
    const [fruits] = await pool.query('SELECT COUNT(*) as total FROM fruits WHERE is_active = TRUE');
    
    // Total suppliers
    const [suppliers] = await pool.query('SELECT COUNT(*) as total FROM suppliers WHERE is_active = TRUE');
    
    // Total registered vendors
    const [vendors] = await pool.query('SELECT COUNT(*) as total FROM street_vendors WHERE status = "Active"');
    
    // Available stock (total boxes)
    const [stock] = await pool.query('SELECT COALESCE(SUM(quantity_available), 0) as total FROM stock');
    
    // Total orders
    const [orders] = await pool.query('SELECT COUNT(*) as total FROM orders');
    
    // Pending orders
    const [pending] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = "Pending"');
    
    // Completed orders
    const [completed] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = "Completed"');
    
    // Sales value (from completed orders)
    const [sales] = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = "Completed"'
    );

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT o.order_number, o.order_date, o.total_amount, o.status, sv.vendor_name
       FROM orders o
       JOIN street_vendors sv ON o.vendor_id = sv.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    // Top selling fruits
    const [topFruits] = await pool.query(
      `SELECT f.name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'Completed'
       GROUP BY f.id, f.name
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    // Stock by fruit
    const [stockByFruit] = await pool.query(
      `SELECT f.name, SUM(s.quantity_available) as available
       FROM stock s
       JOIN products p ON s.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       GROUP BY f.id, f.name
       ORDER BY f.name`
    );

    res.json({
      success: true,
      data: {
        totals: {
          fruits: fruits[0].total,
          suppliers: suppliers[0].total,
          vendors: vendors[0].total,
          availableStock: stock[0].total,
          totalOrders: orders[0].total,
          pendingOrders: pending[0].total,
          completedOrders: completed[0].total,
          salesValue: parseFloat(sales[0].total)
        },
        recentOrders,
        topFruits,
        stockByFruit
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };

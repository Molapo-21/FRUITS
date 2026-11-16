const pool = require('../config/db');

// Available Stock Report
const availableStockReport = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.name AS fruit, bs.name AS box_size, s.quantity_available, p.selling_price,
              (s.quantity_available * p.selling_price) AS stock_value
       FROM stock s
       JOIN products p ON s.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       WHERE p.is_active = TRUE
       ORDER BY f.name, bs.name`
    );
    res.json({ success: true, report: 'Available Stock', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Sales by Fruit
const salesByFruit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.name AS fruit, SUM(oi.quantity) AS boxes_sold, SUM(oi.subtotal) AS total_sales
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN fruits f ON p.fruit_id = f.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'Completed'
       GROUP BY f.id, f.name
       ORDER BY total_sales DESC`
    );
    res.json({ success: true, report: 'Sales by Fruit', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Sales by Box Size
const salesByBoxSize = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT bs.name AS box_size, SUM(oi.quantity) AS boxes_sold, SUM(oi.subtotal) AS total_sales
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN box_sizes bs ON p.box_size_id = bs.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'Completed'
       GROUP BY bs.id, bs.name
       ORDER BY total_sales DESC`
    );
    res.json({ success: true, report: 'Sales by Box Size', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Sales by Street Vendor
const salesByVendor = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT sv.vendor_id, sv.vendor_name, sv.business_name, 
              COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_sales
       FROM orders o
       JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.status = 'Completed'
       GROUP BY sv.id, sv.vendor_id, sv.vendor_name, sv.business_name
       ORDER BY total_sales DESC`
    );
    res.json({ success: true, report: 'Sales by Street Vendor', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Purchases by South African Province
const purchasesByProvince = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.name AS province, COUNT(pu.id) AS purchase_count, 
              SUM(pu.quantity) AS total_boxes, SUM(pu.quantity * pu.purchase_price) AS total_value
       FROM purchases pu
       JOIN suppliers s ON pu.supplier_id = s.id
       JOIN provinces p ON s.province_id = p.id
       GROUP BY p.id, p.name
       ORDER BY total_value DESC`
    );
    res.json({ success: true, report: 'Purchases by Province', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Pending Orders
const pendingOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, sv.vendor_name, sv.business_name
       FROM orders o
       JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.status = 'Pending'
       ORDER BY o.order_date ASC`
    );
    res.json({ success: true, report: 'Pending Orders', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Completed Orders
const completedOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, sv.vendor_name, sv.business_name
       FROM orders o
       JOIN street_vendors sv ON o.vendor_id = sv.id
       WHERE o.status = 'Completed'
       ORDER BY o.order_date DESC`
    );
    res.json({ success: true, report: 'Completed Orders', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

// Total Sales by Date
const salesByDate = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    let query = `
      SELECT o.order_date, COUNT(o.id) AS order_count, SUM(o.total_amount) AS daily_sales
      FROM orders o
      WHERE o.status = 'Completed'
    `;
    const params = [];

    if (from_date) {
      query += ' AND o.order_date >= ?';
      params.push(from_date);
    }
    if (to_date) {
      query += ' AND o.order_date <= ?';
      params.push(to_date);
    }

    query += ' GROUP BY o.order_date ORDER BY o.order_date DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, report: 'Total Sales by Date', count: rows.length, data: rows });
  } catch (error) { next(error); }
};

module.exports = {
  availableStockReport,
  salesByFruit,
  salesByBoxSize,
  salesByVendor,
  purchasesByProvince,
  pendingOrders,
  completedOrders,
  salesByDate
};

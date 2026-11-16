/**
 * Seed script for Batloung Fruits
 * Run: node database/seed.js
 * Make sure MySQL is running and schema.sql has been executed first.
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'batloung_fruits',
      multipleStatements: true
    });

    console.log('Connected to database. Seeding...');

    // Clear existing data (in reverse dependency order)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE purchases');
    await connection.query('TRUNCATE TABLE stock');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE street_vendors');
    await connection.query('TRUNCATE TABLE suppliers');
    await connection.query('TRUNCATE TABLE fruits');
    await connection.query('TRUNCATE TABLE box_sizes');
    await connection.query('TRUNCATE TABLE provinces');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // Users with proper bcrypt hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const salesHash = await bcrypt.hash('sales123', 10);

    await connection.query(
      `INSERT INTO users (username, email, password, full_name, role) VALUES
       ('admin', 'admin@batloungfruits.co.ls', ?, 'System Administrator', 'administrator'),
       ('sales1', 'sales@batloungfruits.co.ls', ?, 'Thabo Sales', 'sales')`,
      [adminHash, salesHash]
    );
    console.log('✓ Users created (admin/admin123, sales1/sales123)');

    // Provinces
    await connection.query(
      `INSERT INTO provinces (name) VALUES
       ('Eastern Cape'), ('Free State'), ('Gauteng'), ('KwaZulu-Natal'),
       ('Limpopo'), ('Mpumalanga'), ('Northern Cape'), ('North West'), ('Western Cape')`
    );
    console.log('✓ 9 Provinces seeded');

    // Box sizes
    await connection.query(
      `INSERT INTO box_sizes (name, description) VALUES
       ('Small', 'A small quantity of fruit intended for street vendors with limited capital or lower expected daily demand.'),
       ('Medium', 'A medium quantity suitable for street vendors with moderate customer demand.'),
       ('Large', 'A larger quantity intended for street vendors who purchase higher volumes.')`
    );
    console.log('✓ Box sizes seeded');

    // Fruits
    await connection.query(
      `INSERT INTO fruits (name, description) VALUES
       ('Apples', 'Fresh apples sourced from Western Cape, Free State and Mpumalanga'),
       ('Bananas', 'Fresh bananas sourced from Limpopo, KwaZulu-Natal and Mpumalanga'),
       ('Oranges', 'Fresh oranges sourced from Limpopo, Mpumalanga and Eastern Cape'),
       ('Mangoes', 'Fresh mangoes sourced from Limpopo, Mpumalanga and KwaZulu-Natal'),
       ('Grapes', 'Fresh grapes sourced from Western Cape, Northern Cape and Limpopo')`
    );
    console.log('✓ Fruits seeded');

    // Products
    await connection.query(
      `INSERT INTO products (fruit_id, box_size_id, selling_price, quantity_per_box) VALUES
       (1,1,150.00,10),(1,2,280.00,20),(1,3,500.00,40),
       (2,1,120.00,12),(2,2,220.00,25),(2,3,400.00,50),
       (3,1,140.00,10),(3,2,260.00,20),(3,3,480.00,40),
       (4,1,180.00,8),(4,2,340.00,16),(4,3,620.00,30),
       (5,1,200.00,5),(5,2,380.00,12),(5,3,700.00,25)`
    );
    console.log('✓ Products (Fruit + Box Size) seeded');

    // Initialize stock
    await connection.query(
      `INSERT INTO stock (product_id, quantity_available)
       SELECT id, 0 FROM products`
    );
    console.log('✓ Stock records initialized');

    // Sample suppliers
    await connection.query(
      `INSERT INTO suppliers (name, province_id, contact_person, telephone, email, physical_address) VALUES
       ('Cape Fresh Produce', 9, 'Johan van der Berg', '+27 21 555 0101', 'johan@capefresh.co.za', '12 Main Road, Stellenbosch, Western Cape'),
       ('Limpopo Fruit Co', 5, 'Grace Mokoena', '+27 15 555 0202', 'grace@limpopofruit.co.za', '45 Industrial Road, Polokwane, Limpopo'),
       ('Mpumalanga Orchards', 6, 'Pieter Botha', '+27 13 555 0303', 'pieter@mporchards.co.za', '8 Farm Road, Nelspruit, Mpumalanga'),
       ('KZN Tropical Fruits', 4, 'Sipho Dlamini', '+27 31 555 0404', 'sipho@kzntropical.co.za', '22 Harbour View, Durban, KwaZulu-Natal'),
       ('Eastern Cape Citrus', 1, 'Nomsa Nkosi', '+27 43 555 0505', 'nomsa@eccitrus.co.za', '5 Citrus Avenue, East London, Eastern Cape')`
    );
    console.log('✓ Sample suppliers seeded');

    // Sample street vendors (Maseru)
    await connection.query(
      `INSERT INTO street_vendors (vendor_id, vendor_name, business_name, telephone, location, registration_date, status) VALUES
       ('VEN0001', 'Mamello Thabo', 'Mamello Fresh Fruits', '+266 5801 2345', 'Pitso Ground', '2024-01-15', 'Active'),
       ('VEN0002', 'Thabo Mokoena', 'Maseru Fruit Stall', '+266 5802 3456', 'Thetsane', '2024-02-20', 'Active'),
       ('VEN0003', 'Palesa Nkosi', 'Palesa Fruits & Veg', '+266 5803 4567', 'Ha Abia', '2024-03-10', 'Active'),
       ('VEN0004', 'Lebohang Molefe', 'Quick Fruit', '+266 5804 5678', 'Maseru West', '2024-04-05', 'Active'),
       ('VEN0005', 'Refiloe Tau', 'Fresh Daily', '+266 5805 6789', 'Ha Tsolo', '2024-05-12', 'Active')`
    );
    console.log('✓ Sample street vendors seeded');

    // Sample purchases (to have stock)
    await connection.query(
      `INSERT INTO purchases (supplier_id, product_id, quantity, purchase_price, purchase_date, created_by) VALUES
       (1, 1, 50, 100.00, '2024-09-01', 1),
       (1, 2, 40, 200.00, '2024-09-01', 1),
       (1, 3, 20, 350.00, '2024-09-01', 1),
       (2, 4, 60, 80.00, '2024-09-05', 1),
       (2, 5, 45, 150.00, '2024-09-05', 1),
       (3, 7, 55, 95.00, '2024-09-10', 1),
       (3, 10, 30, 120.00, '2024-09-10', 1),
       (4, 13, 25, 140.00, '2024-09-15', 1),
       (5, 8, 40, 180.00, '2024-09-18', 1)`
    );

    // Update stock based on purchases
    await connection.query(
      `UPDATE stock s
       JOIN (
         SELECT product_id, SUM(quantity) as total
         FROM purchases
         GROUP BY product_id
       ) p ON s.product_id = p.product_id
       SET s.quantity_available = p.total`
    );
    console.log('✓ Sample purchases & stock updated');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin  → username: admin   password: admin123');
    console.log('  Sales  → username: sales1  password: sales123');
    console.log('');

  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();

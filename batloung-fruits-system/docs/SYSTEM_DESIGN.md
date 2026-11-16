# Batloung Fruits – System Design and Assignment Evidence

## 1. System architecture

The system uses a three-layer full-stack design:

1. **React frontend** – user interface, routing, forms, validation feedback, charts and tables.
2. **Node.js/Express backend** – REST API, authentication, authorization, server-side validation and business rules.
3. **MySQL database** – relational storage with primary keys, foreign keys and integrity constraints.

See `diagrams/system-architecture.png` and `diagrams/system-architecture.svg`.

## 2. Entity Relationship Diagram

The ERD represents the database relationships required by the assignment. See `diagrams/erd.png` and `diagrams/erd.svg`.

Key relationships include:

- Province → Suppliers
- Fruit → Products
- Box Size → Products
- Supplier → Purchases
- Product → Purchases
- Product → Stock
- Street Vendor → Orders
- User → Orders
- Order → Order Items
- Product → Order Items

## 3. Role-based access control

| Function | Administrator | Sales |
|---|---|---|
| Dashboard | View | View |
| Manage suppliers | Yes | No |
| Manage fruits | Yes | No |
| Manage box sizes | Yes | No |
| Manage products | Yes | View |
| Manage stock/purchases | Yes | View |
| Register vendors | Yes | Yes |
| Edit vendors | Yes | Yes |
| Delete/deactivate vendors | Yes | No |
| Create orders | Yes | Yes |
| View/update orders | Yes | Yes |
| Delete orders | Yes | No |
| View reports | Yes | No |

The backend enforces the sensitive permissions; frontend controls are only for usability and do not replace server-side authorization.

## 4. Business rules

- Only Apples, Bananas, Oranges, Mangoes and Grapes are seeded as the initial saleable fruits.
- Every product is a Fruit + Box Size combination.
- Box sizes are Small, Medium and Large.
- Selling price must be greater than zero.
- Orders must belong to registered active vendors.
- Orders must contain at least one item.
- Order quantity must be greater than zero.
- A vendor cannot order more boxes than available stock.
- Completing an order reduces stock.
- Cancelling an order does not reduce stock.
- Supplier records identify the South African province of source.

## 5. Demonstration checklist

For the practical demonstration, show these flows:

1. Open the public dashboard without signing in.
2. Sign in as Administrator.
3. Add/edit/deactivate a fruit.
4. Add/edit/deactivate a box size.
5. Add/edit a Fruit + Box Size product and selling price.
6. Add a supplier and select a South African province.
7. Register a street vendor.
8. Record incoming stock from a supplier.
9. Create an order as a Sales user or Administrator.
10. Attempt to order more boxes than stock to demonstrate validation.
11. Move an order through its status workflow.
12. Complete an order and show stock reduction.
13. Open the reports and demonstrate the required reports.
14. Show the GitHub repository and explain the system architecture/ERD.

# Batloung Fruits API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require header:  
`Authorization: Bearer <token>`

## Authentication

### POST /auth/login
```json
{ "username": "admin", "password": "admin123" }
```
Response: `{ success, token, user }`

### GET /auth/me
Returns current user.

## Fruits
- `GET /fruits` – List (query: search, is_active)
- `GET /fruits/:id`
- `POST /fruits` – Admin only
- `PUT /fruits/:id` – Admin only
- `DELETE /fruits/:id` – Soft delete (Admin)

## Suppliers
- `GET /suppliers` – query: search, province, is_active
- `GET /suppliers/:id`
- `POST /suppliers` – Admin
- `PUT /suppliers/:id` – Admin
- `DELETE /suppliers/:id` – Soft delete (Admin)
- `GET /suppliers/provinces/list`

## Vendors
- `GET /vendors` – query: search, status, location
- `GET /vendors/:id`
- `POST /vendors` – Admin & Sales
- `PUT /vendors/:id`
- `DELETE /vendors/:id` – Soft delete (Admin)

## Products
- `GET /products` – query: fruit_id, box_size_id, search, is_active
- `GET /products/:id`
- `POST /products` – Admin
- `PUT /products/:id` – Admin

## Box Sizes
- `GET /box-sizes` – query: search, is_active
- `GET /box-sizes/:id`
- `POST /box-sizes` – Admin only
- `PUT /box-sizes/:id` – Admin only
- `DELETE /box-sizes/:id` – Admin only; deactivates a size that is already used by products

## Stock
- `GET /stock` – query: search, low_stock
- `POST /stock` – Record incoming stock (Admin)
- `PUT /stock/:id` – Manual adjustment (Admin)
- `GET /stock/purchases` – Purchase history

## Orders
- `GET /orders` – query: search, status, vendor_id, from_date, to_date
- `GET /orders/:id` – Includes order items
- `POST /orders` – Body:
  ```json
  {
    "vendor_id": 1,
    "items": [{ "product_id": 1, "quantity": 5 }],
    "notes": "optional"
  }
  ```
- `PUT /orders/:id` – Update status (triggers stock reduction on Completed)
- `DELETE /orders/:id` – Only Pending/Cancelled (Admin)

## Dashboard
- `GET /dashboard` – All statistics + charts data

## Reports
All report endpoints require the Administrator role.

- `GET /reports/available-stock`
- `GET /reports/sales-by-fruit`
- `GET /reports/sales-by-box-size`
- `GET /reports/sales-by-vendor`
- `GET /reports/purchases-by-province`
- `GET /reports/pending-orders`
- `GET /reports/completed-orders`
- `GET /reports/sales-by-date`

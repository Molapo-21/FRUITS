# Batloung Fruits Distribution Management System

**DIWA2110 – Web Application Development**  
**Full-Stack Group Assignment – React + Node.js/Express + MySQL**

## 1. Overview

Batloung Fruits is a database-driven distribution management system for managing fruits purchased from suppliers in the nine South African provinces and sold to street vendors in Maseru.

The application uses:

- **React 18 + Vite** for the frontend
- **Node.js + Express.js** for the REST API
- **MySQL 8+** for relational data storage
- **JWT + bcrypt** for authentication
- **Role-Based Access Control (RBAC)** for Administrator and Sales users

## 2. Assignment coverage

The implementation covers the required dashboard, fruit and product management, box-size management, supplier management, street-vendor management, stock/purchases, order management, search/filtering, reports, REST APIs, validation, authentication/authorization, relational database design, business rules and full-stack integration.

### Dashboard

- Total fruits
- Total suppliers
- Total registered vendors
- Available stock
- Total orders
- Pending orders
- Completed orders
- Sales value
- Recent orders
- Top-selling fruits
- Stock by fruit chart

### Fruit and product management

- Five required fruits: Apples, Bananas, Oranges, Mangoes and Grapes
- Add, view, edit and deactivate fruits
- Product is represented as **Fruit + Box Size**
- Small, Medium and Large box sizes
- Product selling price and quantity per box
- Search and filtering

### Box-size management

Administrators can add, view, edit, deactivate and search box sizes. The business rule restricts box sizes to **Small, Medium and Large**.

### Supplier management

- Supplier name
- South African source province
- Contact person
- Telephone
- Email
- Physical address
- Add/edit/deactivate/search/filter
- All nine South African provinces are seeded

### Street-vendor management

- Vendor ID
- Vendor name
- Business name
- Telephone
- Maseru location/area
- Registration date
- Status
- Register, view, edit and search vendors

### Stock and purchases

- Record incoming stock from a supplier
- Product and box-size tracking
- Available stock totals
- Purchase history
- Stock is increased when incoming stock is recorded

### Order management

Orders include:

- Street vendor
- Order date
- Product/fruit
- Box size
- Quantity
- Unit price
- Subtotal
- Total order amount
- Order status

Supported statuses:

`Pending` → `Confirmed` → `Processing` → `Ready for Collection/Delivery` → `Completed`

with `Cancelled` available as a cancellation state.

### Required reports

- Available Stock Report
- Sales by Fruit
- Sales by Box Size
- Sales by Street Vendor
- Purchases by South African Province
- Pending Orders
- Completed Orders
- Total Sales by Date

## 3. Security and RBAC

The dashboard is available as the public landing page so the application opens directly at `/` without requiring a sign-in. Management pages require authentication.

| Function | Administrator | Sales |
|---|---:|---:|
| Dashboard | View | View |
| Manage suppliers | Yes | No |
| Manage fruits | Yes | No |
| Manage box sizes | Yes | No |
| Manage products | Yes | View |
| Manage stock/purchases | Yes | View |
| Register street vendors | Yes | Yes |
| Edit street vendors | Yes | Yes |
| Delete/deactivate vendors | Yes | No |
| Create orders | Yes | Yes |
| View/update orders | Yes | Yes |
| Delete orders | Yes | No |
| View reports | Yes | No |

The backend enforces permissions using JWT authentication and role authorization. Frontend permissions are for usability only; they are not relied on as the security boundary.

## 4. Business rules implemented

1. Only the five specified fruits are seeded initially.
2. Every product has a box size.
3. Available box sizes are Small, Medium and Large.
4. Every product must have a selling price greater than zero.
5. Every order belongs to a registered active street vendor.
6. Every order must contain at least one item.
7. Ordered quantity must be greater than zero.
8. A vendor cannot order more boxes than available stock.
9. Completing an order reduces the relevant stock.
10. Cancelled orders do not reduce available stock.
11. Supplier records identify the South African source province.
12. Database primary keys, foreign keys and unique/check constraints protect data integrity.

## 5. System diagrams

See:

- `docs/diagrams/system-architecture.png`
- `docs/diagrams/system-architecture.svg`
- `docs/diagrams/erd.png`
- `docs/diagrams/erd.svg`
- `docs/diagrams/use-case.md`
- `docs/SYSTEM_DESIGN.md`

## 6. Project structure

```text
batloung-fruits-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── SYSTEM_DESIGN.md
│   └── diagrams/
└── README.md
```

`node_modules` and local `.env` credentials are intentionally excluded from the submission package. Run `npm install` in each application folder after extracting the project.

## 7. Installation

### Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8 or newer

### Database

1. Create the database using `backend/database/schema.sql`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set your local MySQL username/password and a strong JWT secret.
4. From the backend folder run the seed script.

```powershell
cd backend
npm install
npm run seed
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite application normally runs at:

```text
http://localhost:5173
```

## 8. Demo accounts

The seed script creates:

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Sales | `sales1` | `sales123` |

Change these credentials before deploying a real system.

## 9. API

The full endpoint list is documented in `docs/API_DOCUMENTATION.md`.

All management APIs require a valid JWT. Administrator-only operations are additionally protected by the backend RBAC middleware.

## 10. Demonstration checklist

For the assignment demonstration:

1. Open `/` and show the dashboard loads directly.
2. Sign in as Administrator.
3. Demonstrate fruit CRUD/deactivation.
4. Demonstrate box-size CRUD/deactivation.
5. Demonstrate Fruit + Box Size product management.
6. Add a supplier and choose a South African province.
7. Register a street vendor.
8. Record incoming stock.
9. Create an order.
10. Demonstrate the insufficient-stock validation.
11. Update an order through its status workflow.
12. Complete an order and show the stock reduction.
13. Demonstrate the required reports.
14. Sign in as Sales and demonstrate the restricted permissions.
15. Show the ERD, architecture diagram, GitHub repository and project structure.

## 11. Documentation

- API documentation: `docs/API_DOCUMENTATION.md`
- System design and RBAC: `docs/SYSTEM_DESIGN.md`
- ERD: `docs/diagrams/erd.png`
- Architecture: `docs/diagrams/system-architecture.png`
- Use cases: `docs/diagrams/use-case.md`

## 12. GitHub submission

Create a GitHub repository for the project and push the project without `node_modules` or local `.env` credentials. Add the repository URL to the Moodle submission field as required by the course.


## Google Maps for Street Vendors

The Street Vendors form now includes a Google Maps preview based on the address/area entered, a link to open that search in Google Maps, and optional latitude/longitude fields for an exact pin. Vendor records with coordinates show a **View map** link in the vendors table.

**Database update for existing installations:** run this once against your existing `batloung_fruits` database:

```sql
ALTER TABLE street_vendors
  MODIFY location VARCHAR(255) NOT NULL,
  ADD COLUMN latitude DECIMAL(10,7) NULL,
  ADD COLUMN longitude DECIMAL(10,7) NULL;
```

If you create the database from scratch using `backend/database/schema.sql`, these columns are already included. This uses Google Maps' public search/embed URLs and does not require a Google Maps API key. The preview is a search preview; to save an exact pin, enter coordinates obtained from Google Maps.


## Vendor distance and travel-time search

The Street Vendors tab includes live search and sorting by nearest/farthest distance or shortest/longest travel time. Select **Use my location** to request browser GPS permission, or enter a starting address/area/landmark and choose **Set starting place**. Vendor records need valid latitude and longitude values for distance/time calculations; add or edit a vendor and pin the exact location on the map when necessary.

- **Distance:** calculated from the starting point to the vendor using the Haversine formula (straight-line distance, not road distance).
- **Driving time:** requested from the public OSRM routing service and may be unavailable if the service is offline or rate-limited.
- **Walking time:** an approximate estimate based on a 4.5 km/h walking speed and straight-line distance; it is not a pedestrian route.
- **Geocoding:** manual starting places are looked up with OpenStreetMap Nominatim. Use these public services respectfully; they have usage limits and are not guaranteed production SLAs.

No Google Maps API key is required for this implementation. For a production deployment, use a supported paid/contracted routing and geocoding provider, follow its terms and rate limits, and keep any private API keys on the backend rather than exposing them in frontend source. The browser geolocation API normally requires HTTPS (localhost is allowed for development).

# Order History & Admin Dashboard APIs

This document outlines the new API endpoints for order management and admin dashboard functionality.

## Order Management APIs

### User Endpoints

#### 1. Place Order
- **URL**: `POST /api/orders/`
- **Authentication**: Required (JWT Token)
- **Description**: Create a new order with cart items
- **Request Body**:
```json
{
  "cart": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "shipping_address": "123 Main St, City, State, ZIP"
}
```
- **Response**: Order object with items and total amount

#### 2. User Order History
- **URL**: `GET /api/orders/history/`
- **Authentication**: Required (JWT Token)
- **Description**: Get current user's order history
- **Query Parameters**:
  - `page`: Page number for pagination
- **Response**: Paginated list of user's orders

#### 3. User Order Detail
- **URL**: `GET /api/orders/{order_id}/`
- **Authentication**: Required (JWT Token)
- **Description**: Get detailed information about a specific order (user can only access their own orders)

### Admin Endpoints

#### 4. Admin Order List
- **URL**: `GET /api/admin/orders/`
- **Authentication**: Required (Admin only)
- **Description**: Get all orders with filtering options
- **Query Parameters**:
  - `status`: Filter by order status (pending, processing, shipped, delivered, cancelled)
  - `is_paid`: Filter by payment status (true/false)
  - `date_from`: Filter orders from this date (YYYY-MM-DD)
  - `date_to`: Filter orders until this date (YYYY-MM-DD)
  - `page`: Page number for pagination

#### 5. Admin Order Detail
- **URL**: `GET/PUT /api/admin/orders/{order_id}/`
- **Authentication**: Required (Admin only)
- **Description**: Get or update detailed order information

#### 6. Update Order Status
- **URL**: `PATCH /api/admin/orders/{order_id}/status/`
- **Authentication**: Required (Admin only)
- **Description**: Update order status and payment status
- **Request Body**:
```json
{
  "status": "shipped",
  "is_paid": true
}
```

#### 7. Admin Dashboard Statistics
- **URL**: `GET /api/admin/dashboard/stats/`
- **Authentication**: Required (Admin only)
- **Description**: Get comprehensive dashboard statistics
- **Query Parameters**:
  - `days`: Number of days to include in statistics (default: 30)
- **Response**:
```json
{
  "period_days": 30,
  "total_orders": 150,
  "total_sales": "15750.00",
  "paid_orders": 120,
  "pending_orders": 25,
  "orders_by_status": [
    {"status": "pending", "count": 25},
    {"status": "processing", "count": 30},
    {"status": "shipped", "count": 45},
    {"status": "delivered", "count": 50}
  ],
  "recent_orders": [...],
  "daily_sales": [
    {"date": "2024-01-01", "orders_count": 5, "sales_amount": "500.00"},
    ...
  ],
  "top_products": [
    {"product__id": 1, "product__title": "Product Name", "total_quantity": 50, "total_revenue": "1000.00"},
    ...
  ]
}
```

## Order Model Fields

### Order
- `id`: Unique identifier
- `user`: Foreign key to User model
- `shipping_address`: Text field for delivery address
- `created_at`: Timestamp of order creation
- `updated_at`: Timestamp of last update
- `is_paid`: Boolean for payment status
- `status`: Choice field (pending, processing, shipped, delivered, cancelled)
- `total_amount`: Calculated total amount of the order

### OrderItem
- `id`: Unique identifier
- `order`: Foreign key to Order
- `product`: Foreign key to Product
- `quantity`: Number of items ordered
- `price`: Price at the time of order
- `subtotal`: Calculated property (quantity × price)

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints require the user to have admin privileges (`is_staff=True`).

## Error Responses

Common error responses:
- `400 Bad Request`: Invalid data or missing required fields
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions (admin required)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Example Usage

### Creating an Order
```python
import requests

headers = {'Authorization': 'Bearer YOUR_JWT_TOKEN'}
data = {
    'cart': [
        {'product_id': 1, 'quantity': 2},
        {'product_id': 3, 'quantity': 1}
    ],
    'shipping_address': '123 Main St, City, State, ZIP'
}

response = requests.post('http://localhost:8000/api/orders/', 
                        json=data, headers=headers)
```

### Getting Order History
```python
headers = {'Authorization': 'Bearer YOUR_JWT_TOKEN'}
response = requests.get('http://localhost:8000/api/orders/history/', 
                       headers=headers)
```

### Admin Dashboard Stats
```python
headers = {'Authorization': 'Bearer ADMIN_JWT_TOKEN'}
response = requests.get('http://localhost:8000/api/admin/dashboard/stats/?days=7', 
                       headers=headers)
```

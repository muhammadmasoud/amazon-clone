# Order Management System - Complete Guide

This document explains every aspect of the Order History & Admin Dashboard implementation for your Amazon clone project.

## 📁 File Structure & Purpose

```
backend/orders/
├── models.py                    # Database models (Order, OrderItem)
├── serializers.py              # Data conversion (JSON ↔ Python objects)
├── views.py                     # API endpoints logic
├── urls.py                      # URL routing configuration
├── admin.py                     # Django admin interface
└── management/
    └── commands/
        └── create_sample_orders.py  # Sample data generator
```

## 🗃️ Database Design

### Order Model
```python
class Order(models.Model):
    user = models.ForeignKey(User)           # Who placed the order
    shipping_address = models.TextField()   # Where to deliver
    created_at = models.DateTimeField()     # When order was placed
    updated_at = models.DateTimeField()     # Last modification
    is_paid = models.BooleanField()         # Payment status
    status = models.CharField()             # Order progress
    total_amount = models.DecimalField()    # Total cost
```

**Status Flow:** pending → processing → shipped → delivered

### OrderItem Model
```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order)        # Which order this belongs to
    product = models.ForeignKey(Product)    # What product was ordered
    quantity = models.PositiveIntegerField() # How many items
    price = models.DecimalField()           # Price at time of order
```

**Why store price?** Product prices change over time, but order history should show the original price paid.

## 🔄 How the Order Process Works

### 1. User Places Order (POST /api/orders/)
```python
# Frontend sends cart data:
{
    "cart": [
        {"product_id": 1, "quantity": 2},
        {"product_id": 3, "quantity": 1}
    ],
    "shipping_address": "123 Main St..."
}

# Backend process:
1. Validate user is authenticated
2. Check each product exists
3. Verify sufficient stock
4. Create Order object
5. Create OrderItem for each cart item
6. Update product stock levels
7. Calculate and save total amount
8. Return order details
```

### 2. Stock Management
```python
# Before creating order item:
if product.stock < quantity:
    return error("Insufficient stock")

# After creating order item:
product.stock -= quantity
product.save()
```

### 3. Total Calculation
```python
total = Decimal('0')
for item in cart_items:
    total += item.price * item.quantity
order.total_amount = total
```

## 🔐 Authentication & Security

### JWT Token Authentication
```python
# All endpoints require this header:
Authorization: Bearer <your_jwt_token>

# Get token by logging in:
POST /account/login/
{
    "username": "your_username",
    "password": "your_password"
}
```

### Permission Levels
1. **Anonymous Users**: No access to order endpoints
2. **Authenticated Users**: Can view/create their own orders only
3. **Admin Users**: Can view/modify all orders + dashboard access

### Security Features
```python
# Users can only see their own orders:
def get_queryset(self):
    return Order.objects.filter(user=self.request.user)

# Admin-only endpoints:
permission_classes = [IsAdminUser]
```

## 📊 API Endpoints Explained

### User Endpoints

#### 1. Place Order
```http
POST /api/orders/
Content-Type: application/json
Authorization: Bearer <token>

{
    "cart": [{"product_id": 1, "quantity": 2}],
    "shipping_address": "123 Main St"
}
```
**What happens:**
- Creates Order with current user
- Creates OrderItem for each cart item
- Reduces product stock
- Calculates total amount

#### 2. Order History
```http
GET /api/orders/history/?page=1
Authorization: Bearer <token>
```
**Returns:**
- Paginated list of user's orders
- Basic order info + item count
- Optimized for quick loading

#### 3. Order Details
```http
GET /api/orders/123/
Authorization: Bearer <token>
```
**Returns:**
- Complete order information
- All order items with product details
- Only if order belongs to requesting user

### Admin Endpoints

#### 1. All Orders List
```http
GET /api/admin/orders/?status=pending&is_paid=false&page=1
Authorization: Bearer <admin_token>
```
**Features:**
- View all orders in system
- Filter by status, payment, date range
- Pagination for performance

#### 2. Dashboard Statistics
```http
GET /api/admin/dashboard/stats/?days=30
Authorization: Bearer <admin_token>
```
**Returns:**
```json
{
    "total_orders": 150,
    "total_sales": "15750.00",
    "paid_orders": 120,
    "pending_orders": 25,
    "orders_by_status": [...],
    "daily_sales": [...],
    "top_products": [...]
}
```

#### 3. Update Order Status
```http
PATCH /api/admin/orders/123/status/
Authorization: Bearer <admin_token>

{
    "status": "shipped",
    "is_paid": true
}
```

## 🔧 Django Components Explained

### Serializers (Data Conversion)
```python
# Convert database objects to JSON and vice versa
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # Nested data
    user_name = serializers.CharField(source='user.username')  # Related field
    
    class Meta:
        fields = ['id', 'user_name', 'total_amount', ...]  # What to include
        read_only_fields = ['created_at', 'total_amount']  # Can't be modified
```

### Views (Business Logic)
```python
# Class-based view for listing with pagination
class UserOrderHistoryView(generics.ListAPIView):
    serializer_class = UserOrderHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

# Function-based view for custom logic
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    # Custom statistics calculation
    return Response(stats_data)
```

### URL Routing
```python
# Map URLs to views
urlpatterns = [
    path('orders/', PlaceOrderView.as_view()),           # Class-based view
    path('admin/stats/', admin_dashboard_stats),         # Function-based view
    path('orders/<int:pk>/', UserOrderDetailView.as_view()),  # With parameter
]
```

## 🎯 Database Optimization

### Query Optimization
```python
# Bad: Causes N+1 queries
orders = Order.objects.all()
for order in orders:
    print(order.user.username)  # Database query for each order

# Good: Fetch related data in one query
orders = Order.objects.select_related('user').all()
for order in orders:
    print(order.user.username)  # No extra queries

# For many-to-many or reverse foreign keys:
orders = Order.objects.prefetch_related('items__product').all()
```

### Aggregation (Statistics)
```python
# Calculate totals without fetching all records
total_sales = Order.objects.aggregate(
    total=Sum('total_amount')
)['total']

# Group by and count
orders_by_status = Order.objects.values('status').annotate(
    count=Count('id')
)
```

## 🧪 Testing & Sample Data

### Create Sample Data
```bash
# Create test orders, users, and products
python manage.py create_sample_orders --count 20
```

### Manual Testing
```python
# 1. Get authentication token
response = requests.post('/account/login/', {
    'username': 'testuser1',
    'password': 'testpass123'
})
token = response.json()['access']

# 2. Use token in subsequent requests
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('/api/orders/history/', headers=headers)
```

## 🚀 Production Considerations

### Performance
- Database indexing on frequently queried fields
- Pagination for large datasets
- Query optimization with select_related/prefetch_related

### Security
- Input validation in serializers
- Authentication required for all endpoints
- User isolation (can't access other users' data)

### Scalability
- Separate read/write databases
- Caching for frequently accessed data
- Background tasks for heavy operations

## 🔍 Common Issues & Solutions

### Issue: "401 Unauthorized"
**Cause:** Missing or invalid JWT token
**Solution:** 
```python
# Get token first
POST /account/login/ {"username": "...", "password": "..."}
# Then use in headers
Authorization: Bearer <token>
```

### Issue: "403 Forbidden" on admin endpoints
**Cause:** User is not admin
**Solution:** Make user admin in Django admin or:
```python
user.is_staff = True
user.save()
```

### Issue: Order total is 0
**Cause:** Total not calculated after creating items
**Solution:** Call `order.calculate_total()` or ensure view logic calculates it

## 📚 Django Concepts Used

1. **Models**: Database structure and relationships
2. **Serializers**: Data validation and conversion
3. **Views**: Business logic and API endpoints
4. **URLs**: Routing requests to appropriate views
5. **Permissions**: Access control and security
6. **Admin**: Built-in administrative interface
7. **Management Commands**: Custom administrative tasks

This implementation follows Django REST Framework best practices and provides a solid foundation for an e-commerce order management system.

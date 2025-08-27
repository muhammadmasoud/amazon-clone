# Amazon Clone - Database Schema Documentation

Generated on: August 27, 2025

## Overview
This document provides a comprehensive overview of the database schema for the Amazon Clone e-commerce application built with Django. The application consists of 6 main apps: Users, Products, Cart, Orders, Payments, and Contact.

## Apps and Models

### 1. Users App

#### User Model (extends AbstractUser)
Custom user model with additional fields for e-commerce functionality.

```python
class User(AbstractUser):
    # Basic Information
    first_name = CharField(max_length=30, blank=True)
    last_name = CharField(max_length=30, blank=True) 
    email = EmailField(unique=True)  # Used for login
    mobile = CharField(max_length=50, null=True, blank=True)
    address = TextField(null=True, blank=True)
    
    # Email Verification
    is_email_verified = BooleanField(default=False)
    email_verification_token = UUIDField(default=uuid4)
    
    # Password Reset
    password_reset_token = UUIDField(null=True, blank=True)
    password_reset_token_created = DateTimeField(null=True, blank=True)
```

**Key Features:**
- Email-based authentication
- Email verification system
- Password reset functionality
- Mobile and address storage

---

### 2. Products App

#### Category Model
Product categorization system.

```python
class Category:
    name = CharField(max_length=255, unique=True)
    description = TextField(blank=True)
```

#### Product Model
Core product information with pricing and inventory.

```python
class Product:
    title = CharField(max_length=255)
    description = TextField(max_length=1000)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    image = ImageField(upload_to='products/', blank=True, null=True)
    stock = PositiveSmallIntegerField(default=0)
    date_added = DateTimeField(auto_now_add=True)
    category = ForeignKey(Category, on_delete=CASCADE, null=True)
```

#### Review Model
Product review and rating system.

```python
class Review:
    product = ForeignKey(Product, on_delete=CASCADE)
    user = ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    title = CharField(max_length=255)
    content = TextField()
    rating = PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = DateTimeField(auto_now_add=True)
```

**Constraints:**
- Unique constraint on (user, product) - one review per user per product

---

### 3. Cart App

#### Cart Model
Shopping cart with discount support.

```python
class Cart:
    user = OneToOneField(User, on_delete=CASCADE)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    promo_code = CharField(max_length=50, blank=True, null=True)
    discount_amount = DecimalField(max_digits=10, decimal_places=2, default=0)
```

**Business Logic:**
- Free shipping over $100
- 10% tax calculation
- Automatic total calculation with shipping, tax, and discounts

#### CartItem Model
Individual items in shopping cart with price protection.

```python
class CartItem:
    cart = ForeignKey(Cart, related_name='items', on_delete=CASCADE)
    product = ForeignKey(Product, on_delete=CASCADE)
    quantity = PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(999)])
    price_when_added = DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    added_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(auto_now=True)
```

**Constraints:**
- Unique constraint on (cart, product)
- Quantity limits: 1-999

---

### 4. Orders App

#### Order Model
Comprehensive order management with status tracking.

```python
class Order:
    # Identification
    order_number = CharField(max_length=20, unique=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='orders')
    
    # Shipping Information
    shipping_address = TextField()
    shipping_city = CharField(max_length=100)
    shipping_state = CharField(max_length=100)
    shipping_zip = CharField(max_length=20)
    shipping_country = CharField(max_length=100, default='USA')
    shipping_phone = CharField(max_length=20)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    confirmed_at = DateTimeField(null=True, blank=True)
    shipped_at = DateTimeField(null=True, blank=True)
    delivered_at = DateTimeField(null=True, blank=True)
    
    # Payment Information
    is_paid = BooleanField(default=False)
    payment_method = CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = DateTimeField(null=True, blank=True)
    
    # Status and Financial
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional Information
    customer_notes = TextField(blank=True)
    admin_notes = TextField(blank=True)
    tracking_number = CharField(max_length=100, blank=True)
    courier_service = CharField(max_length=100, blank=True)
    promo_code = CharField(max_length=50, blank=True)
```

**Status Choices:**
- pending, confirmed, processing, packed, shipped, out_for_delivery, delivered, cancelled, returned

**Payment Method Choices:**
- cash_on_delivery, credit_card, debit_card, paypal, bank_transfer, stripe

#### OrderItem Model
Individual products within an order with historical price tracking.

```python
class OrderItem:
    order = ForeignKey(Order, on_delete=CASCADE, related_name='items')
    product = ForeignKey(Product, on_delete=CASCADE)
    quantity = PositiveIntegerField()
    price = DecimalField(max_digits=10, decimal_places=2)
    product_title = CharField(max_length=255)
    product_sku = CharField(max_length=100, blank=True)
    is_fulfilled = BooleanField(default=False)
    fulfilled_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

---

### 5. Payments App

#### Payment Model
Comprehensive payment tracking with Stripe integration.

```python
class Payment:
    # Identification
    payment_id = CharField(max_length=50, unique=True)
    stripe_payment_intent_id = CharField(max_length=200, blank=True, null=True)
    
    # Relationships
    order = OneToOneField(Order, on_delete=CASCADE, related_name='payment')
    user = ForeignKey(User, on_delete=CASCADE, related_name='payments')
    
    # Payment Details
    amount = DecimalField(max_digits=10, decimal_places=2)
    currency = CharField(max_length=3, default='USD')
    payment_method = CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Stripe Integration
    stripe_client_secret = CharField(max_length=500, blank=True, null=True)
    stripe_charge_id = CharField(max_length=200, blank=True, null=True)
    
    # Timestamps and Metadata
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    paid_at = DateTimeField(null=True, blank=True)
    failure_reason = TextField(blank=True, null=True)
    refund_reason = TextField(blank=True, null=True)
```

**Payment Status Choices:**
- pending, processing, succeeded, failed, cancelled, refunded

#### StripeWebhookEvent Model
Webhook event tracking to prevent duplicate processing.

```python
class StripeWebhookEvent:
    stripe_event_id = CharField(max_length=200, unique=True)
    event_type = CharField(max_length=100)
    processed = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

---

### 6. Contact App

#### ContactMessage Model
Customer support and inquiry system.

```python
class ContactMessage:
    id = UUIDField(primary_key=True, default=uuid4)
    
    # User Information
    user = ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    name = CharField(max_length=100)
    email = EmailField()
    
    # Message Details
    subject = CharField(max_length=200)
    category = CharField(max_length=20, choices=CATEGORY_CHOICES)
    message = TextField()
    order_number = CharField(max_length=50, blank=True, null=True)
    
    # Status Tracking
    status = CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    response_sent = BooleanField(default=False)
    response_sent_at = DateTimeField(null=True, blank=True)
```

**Category Choices:**
- order_issue, delivery_problem, product_question, payment_issue, account_help, technical_support, general_inquiry, complaint, suggestion

**Status Choices:**
- new, in_progress, resolved, closed

---

## Database Relationships

### Primary Relationships
1. **User ↔ Cart**: One-to-One
2. **User ↔ Orders**: One-to-Many
3. **User ↔ Reviews**: One-to-Many  
4. **User ↔ Payments**: One-to-Many
5. **User ↔ ContactMessages**: One-to-Many (optional)

### Product Relationships
6. **Category ↔ Products**: One-to-Many
7. **Product ↔ Reviews**: One-to-Many
8. **Product ↔ CartItems**: One-to-Many
9. **Product ↔ OrderItems**: One-to-Many

### Order and Cart Relationships
10. **Cart ↔ CartItems**: One-to-Many
11. **Order ↔ OrderItems**: One-to-Many
12. **Order ↔ Payment**: One-to-One

---

## Database Indexes

### Automatically Created Indexes
- Primary keys on all models
- Foreign key indexes
- Unique field indexes (email, order_number, payment_id, etc.)

### Custom Indexes (Order Model)
```python
indexes = [
    models.Index(fields=['order_number']),
    models.Index(fields=['user', '-created_at']),
    models.Index(fields=['status']),
]
```

---

## Key Features

### Security Features
- Email verification system
- Password reset with token expiration (24 hours)
- UUID-based tokens for security

### Business Logic
- Price protection in cart (stores price when added)
- Historical price tracking in orders
- Automatic order number generation
- Payment ID generation
- Tax and shipping calculations
- Stock management
- Review rating system with averages

### Data Integrity
- Unique constraints prevent duplicate reviews per user/product
- Unique constraints prevent duplicate cart items
- Foreign key relationships maintain referential integrity
- Validation on rating values (1-5)
- Quantity limits on cart items (1-999)

### Audit Trail
- Creation and update timestamps on most models
- Order status tracking with timestamps
- Payment status tracking
- Webhook event deduplication

---

## File Locations

- **Users**: `backend/users/models.py`
- **Products**: `backend/products/models.py`  
- **Cart**: `backend/cart/models.py`
- **Orders**: `backend/orders/models.py`
- **Payments**: `backend/payments/models.py`
- **Contact**: `backend/contact/models.py`

---

*This schema supports a full-featured e-commerce platform with user management, product catalog, shopping cart, order processing, payment handling, and customer support functionality.*

# Amazon Clone - Entity Relationship Diagram (ERD)

Generated on: August 27, 2025

## ERD Overview
This Entity Relationship Diagram shows the database structure and relationships for the Amazon Clone e-commerce application.

## Visual ERD Representation

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                         USER                                │
                                    │─────────────────────────────────────────────────────────────│
                                    │ PK  id (AutoField)                                          │
                                    │     username (CharField) UNIQUE                             │
                                    │     first_name (CharField)                                  │
                                    │     last_name (CharField)                                   │
                                    │     email (EmailField) UNIQUE                               │
                                    │     mobile (CharField)                                      │
                                    │     address (TextField)                                     │
                                    │     is_email_verified (BooleanField)                       │
                                    │     email_verification_token (UUIDField)                   │
                                    │     password_reset_token (UUIDField)                       │
                                    │     password_reset_token_created (DateTimeField)           │
                                    │     date_joined (DateTimeField)                             │
                                    │     last_login (DateTimeField)                              │
                                    │     is_active (BooleanField)                                │
                                    │     is_staff (BooleanField)                                 │
                                    │     is_superuser (BooleanField)                             │
                                    └─────────────────────────┬───────────────────────────────────┘
                                                              │
                        ┌─────────────────────────────────────┼─────────────────────────────────────┐
                        │                                     │                                     │
                        │ 1:1                                 │ 1:M                                 │ 1:M
                        ▼                                     ▼                                     ▼
        ┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
        │            CART                 │   │            ORDER                │   │            REVIEW               │
        │─────────────────────────────────│   │─────────────────────────────────│   │─────────────────────────────────│
        │ PK  id (AutoField)              │   │ PK  id (AutoField)              │   │ PK  id (AutoField)              │
        │ FK  user_id → User              │   │     order_number (CharField)    │   │ FK  user_id → User              │
        │     created_at (DateTimeField)  │   │ FK  user_id → User              │   │ FK  product_id → Product        │
        │     updated_at (DateTimeField)  │   │     shipping_address (TextField)│   │     title (CharField)           │
        │     promo_code (CharField)      │   │     shipping_city (CharField)   │   │     content (TextField)         │
        │     discount_amount (Decimal)   │   │     shipping_state (CharField)  │   │     rating (PositiveSmallInt)   │
        └─────────────────┬───────────────┘   │     shipping_zip (CharField)    │   │     created_at (DateTimeField)  │
                          │                   │     shipping_country (CharField)│   └─────────────────────────────────┘
                          │ 1:M               │     shipping_phone (CharField)  │
                          ▼                   │     created_at (DateTimeField)  │
        ┌─────────────────────────────────┐   │     updated_at (DateTimeField)  │
        │          CART_ITEM              │   │     confirmed_at (DateTimeField)│
        │─────────────────────────────────│   │     shipped_at (DateTimeField)  │
        │ PK  id (AutoField)              │   │     delivered_at (DateTimeField)│
        │ FK  cart_id → Cart              │   │     is_paid (BooleanField)      │
        │ FK  product_id → Product        │   │     payment_method (CharField)  │
        │     quantity (PositiveInteger)  │   │     payment_date (DateTimeField)│
        │     price_when_added (Decimal)  │   │     status (CharField)          │
        │     added_at (DateTimeField)    │   │     subtotal (DecimalField)     │
        │     updated_at (DateTimeField)  │   │     shipping_cost (DecimalField)│
        └─────────────────┬───────────────┘   │     tax_amount (DecimalField)   │
                          │                   │     discount_amount (Decimal)   │
                          │ M:1               │     total_amount (DecimalField) │
                          ▼                   │     customer_notes (TextField)  │
        ┌─────────────────────────────────┐   │     admin_notes (TextField)     │
        │           PRODUCT               │   │     tracking_number (CharField) │
        │─────────────────────────────────│   │     courier_service (CharField) │
        │ PK  id (AutoField)              │   │     promo_code (CharField)      │
        │     title (CharField)           │   └─────────────────┬───────────────┘
        │     description (TextField)     │                     │
        │     unit_price (DecimalField)   │                     │ 1:M
        │     image (ImageField)          │                     ▼
        │     stock (PositiveSmallInt)    │   ┌─────────────────────────────────┐
        │     date_added (DateTimeField)  │   │          ORDER_ITEM             │
        │ FK  category_id → Category      │   │─────────────────────────────────│
        └─────────────────┬───────────────┘   │ PK  id (AutoField)              │
                          │                   │ FK  order_id → Order            │
                          │ M:1               │ FK  product_id → Product        │
                          ▼                   │     quantity (PositiveInteger)  │
        ┌─────────────────────────────────┐   │     price (DecimalField)        │
        │          CATEGORY               │   │     product_title (CharField)   │
        │─────────────────────────────────│   │     product_sku (CharField)     │
        │ PK  id (AutoField)              │   │     is_fulfilled (BooleanField) │
        │     name (CharField) UNIQUE     │   │     fulfilled_at (DateTimeField)│
        │     description (TextField)     │   │     created_at (DateTimeField)  │
        └─────────────────────────────────┘   └─────────────────┬───────────────┘
                                                                │
                                                                │ M:1
                                                                ▼
                                              ┌─────────────────────────────────┐
                                              │           PAYMENT               │
                                              │─────────────────────────────────│
                                              │ PK  id (AutoField)              │
                                              │     payment_id (CharField) UQ   │
                                              │     stripe_payment_intent_id    │
                                              │ FK  order_id → Order (1:1)      │
                                              │ FK  user_id → User              │
                                              │     amount (DecimalField)       │
                                              │     currency (CharField)        │
                                              │     payment_method (CharField)  │
                                              │     status (CharField)          │
                                              │     stripe_client_secret        │
                                              │     stripe_charge_id            │
                                              │     created_at (DateTimeField)  │
                                              │     updated_at (DateTimeField)  │
                                              │     paid_at (DateTimeField)     │
                                              │     failure_reason (TextField)  │
                                              │     refund_reason (TextField)   │
                                              └─────────────────────────────────┘

                                              ┌─────────────────────────────────┐
                                              │    STRIPE_WEBHOOK_EVENT         │
                                              │─────────────────────────────────│
                                              │ PK  id (AutoField)              │
                                              │     stripe_event_id (CharField) │
                                              │     event_type (CharField)      │
                                              │     processed (BooleanField)    │
                                              │     created_at (DateTimeField)  │
                                              └─────────────────────────────────┘

                                              ┌─────────────────────────────────┐
                                              │      CONTACT_MESSAGE            │
                                              │─────────────────────────────────│
                                              │ PK  id (UUIDField)              │
                                              │ FK  user_id → User (Optional)   │
                                              │     name (CharField)            │
                                              │     email (EmailField)         │
                                              │     subject (CharField)         │
                                              │     category (CharField)        │
                                              │     message (TextField)         │
                                              │     order_number (CharField)    │
                                              │     status (CharField)          │
                                              │     created_at (DateTimeField)  │
                                              │     updated_at (DateTimeField)  │
                                              │     response_sent (Boolean)     │
                                              │     response_sent_at (DateTime) │
                                              └─────────────────────────────────┘
```

## Relationship Details

### 1. User Relationships
- **User → Cart**: One-to-One (Each user has exactly one cart)
- **User → Orders**: One-to-Many (Each user can have multiple orders)
- **User → Reviews**: One-to-Many (Each user can write multiple reviews)
- **User → Payments**: One-to-Many (Each user can have multiple payments)
- **User → ContactMessages**: One-to-Many (Each user can send multiple messages, optional)

### 2. Product Relationships
- **Category → Products**: One-to-Many (Each category can have multiple products)
- **Product → Reviews**: One-to-Many (Each product can have multiple reviews)
- **Product → CartItems**: One-to-Many (Each product can be in multiple carts)
- **Product → OrderItems**: One-to-Many (Each product can be in multiple orders)

### 3. Cart Relationships
- **Cart → CartItems**: One-to-Many (Each cart can have multiple items)
- **CartItem → Product**: Many-to-One (Multiple cart items can reference the same product)

### 4. Order Relationships
- **Order → OrderItems**: One-to-Many (Each order can have multiple items)
- **Order → Payment**: One-to-One (Each order has exactly one payment record)
- **OrderItem → Product**: Many-to-One (Multiple order items can reference the same product)

### 5. Payment Relationships
- **Payment → Order**: One-to-One (Each payment belongs to one order)
- **Payment → User**: Many-to-One (Each user can have multiple payments)

## Constraints and Indexes

### Unique Constraints
1. **User**: email, username
2. **Category**: name
3. **Order**: order_number
4. **Payment**: payment_id
5. **Review**: (user_id, product_id) - One review per user per product
6. **CartItem**: (cart_id, product_id) - One entry per product per cart
7. **StripeWebhookEvent**: stripe_event_id

### Database Indexes
1. **Primary Keys**: All tables have auto-incrementing primary keys
2. **Foreign Keys**: Automatic indexes on all foreign key fields
3. **Custom Indexes on Order**:
   - order_number (unique)
   - (user_id, created_at) - for user order history
   - status - for order filtering

### Validation Rules
1. **Review.rating**: Must be between 1-5
2. **CartItem.quantity**: Must be between 1-999
3. **User.email**: Must be valid email format
4. **Password reset token**: Expires after 24 hours

## Business Logic Highlights

### Cart Business Logic
- **Price Protection**: Stores product price when added to cart
- **Free Shipping**: Orders over $100 get free shipping
- **Tax Calculation**: 10% tax applied to subtotal
- **Discount Support**: Promo codes can apply discounts

### Order Business Logic
- **Auto Order Numbers**: Generated using UUID (ORD-XXXXXXXX format)
- **Status Tracking**: 9 different order statuses
- **Historical Pricing**: Stores product price at time of order
- **Fulfillment Tracking**: Individual items can be marked as fulfilled

### Payment Business Logic
- **Multiple Payment Methods**: Stripe, Cash on Delivery, etc.
- **Payment Status Tracking**: pending → processing → succeeded/failed
- **Webhook Deduplication**: Prevents duplicate processing of Stripe events
- **Auto Payment IDs**: Generated using UUID (PAY-XXXXXXXXXXXX format)

### Security Features
- **Email Verification**: Users must verify email before full access
- **Password Reset**: Secure token-based password reset with expiration
- **UUID Tokens**: All sensitive tokens use UUID for security

## Data Flow Examples

### 1. User Registration → Email Verification
```
User → generates email_verification_token → Email sent → User clicks link → is_email_verified = True
```

### 2. Shopping Flow
```
User → adds Product to Cart → CartItem created → User checks out → Order created → OrderItems created → Payment processed
```

### 3. Review Flow
```
User → purchases Product → Order delivered → User writes Review (with unique constraint)
```

### 4. Contact Support Flow
```
User → submits ContactMessage → Admin processes → response_sent = True
```

---

*This ERD represents a complete e-commerce database schema with proper normalization, referential integrity, and business logic constraints.*

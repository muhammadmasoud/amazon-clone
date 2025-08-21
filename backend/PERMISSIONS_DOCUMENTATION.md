# Django Permissions and Serializers Validation Documentation

## Overview

This document outlines the comprehensive permissions and validation system implemented for the Amazon Clone project. The system ensures proper access control and data validation across all API endpoints.

## Custom Permission Classes

### 1. IsOwnerOrReadOnly
- **Purpose**: Allows read access to everyone, write access only to object owners
- **Use Case**: User profiles, reviews, orders
- **Implementation**: Checks if `obj.user == request.user` for write operations

### 2. IsOwner
- **Purpose**: Only allows object owners to access their data
- **Use Case**: Sensitive user data, private orders
- **Implementation**: Restricts all access to object owners only

### 3. IsAdminOrReadOnly
- **Purpose**: Read access for authenticated users, write access only for admins
- **Use Case**: Product management, category management
- **Implementation**: Checks `request.user.is_staff` for write operations

### 4. IsEmailVerified
- **Purpose**: Ensures user's email is verified before access
- **Use Case**: Critical operations requiring verified users
- **Implementation**: Checks `request.user.is_email_verified`

### 5. IsVerifiedUser
- **Purpose**: Combination of authentication and email verification
- **Use Case**: Reviews, orders, cart operations
- **Implementation**: Checks both authentication and email verification

## API Endpoint Permissions

### Products API
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/products/` | GET | Public | Anyone can view products |
| `/products/` | POST | Admin Only | Only admins can create products |
| `/products/{id}/` | GET | Public | Anyone can view product details |
| `/products/{id}/` | PUT/PATCH/DELETE | Admin Only | Only admins can modify products |
| `/products/{id}/reviews/` | GET | Public | Anyone can view reviews |
| `/products/{id}/reviews/` | POST | Verified Users | Only verified users can create reviews |

### Users API
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/auth/signup/` | POST | Public | User registration |
| `/auth/login/` | POST | Public | User authentication |
| `/auth/profile/` | GET/PUT | Authenticated | User profile access |
| `/auth/change-password/` | POST | Authenticated | Password change |
| `/auth/orders/` | GET | Verified Users | User's order history |

### Orders API
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/orders/` | POST | Verified Users | Place new order |
| `/api/orders/history/` | GET | Verified Users | User's order history |
| `/api/orders/{id}/` | GET | Owner Only | Specific order details |
| `/api/admin/orders/` | GET | Admin Only | Admin order management |
| `/api/admin/orders/{id}/` | GET/PUT | Admin Only | Admin order operations |

### Cart API
| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/cart/` | GET/POST/DELETE | Verified Users | Cart management |
| `/cart/items/{id}/` | PUT/DELETE | Verified Users | Cart item operations |
| `/cart/summary/` | GET | Verified Users | Cart summary |

## Serializer Validation

### Product Serializer
```python
class ProductSerializer(serializers.ModelSerializer):
    # Validations implemented:
    - title: Required, max 255 chars, unique (case-insensitive)
    - description: Required, max 1000 chars
    - unit_price: Minimum 0.01, max 8 digits before decimal
    - stock: Non-negative integer
    - category: Must exist and be valid
```

### User Serializer
```python
class UserSerializer(serializers.ModelSerializer):
    # Validations implemented:
    - first_name/last_name: Required, letters only, auto-capitalize
    - email: Valid format, unique, normalized to lowercase
    - password: Django password validation (min 8 chars, complexity)
    - password_confirm: Must match password
```

### Order Serializer
```python
class OrderSerializer(serializers.ModelSerializer):
    # Validations implemented:
    - shipping_address: Required, min 10 chars, max 500 chars
    - status: Must be valid choice from STATUS_CHOICES
    - cart items: Product existence, stock availability, quantity limits
```

### Review Serializer
```python
class ReviewSerializer(serializers.ModelSerializer):
    # Validations implemented:
    - title: Required, min 3 chars, max 255 chars
    - content: Required, min 10 chars
    - rating: Integer between 1-5
    - duplicate prevention: One review per user per product
```

## Security Features

### 1. Email Verification Requirement
- Critical operations require verified email
- Prevents spam and fake accounts
- Implemented in reviews, orders, cart operations

### 2. Rate Limiting
```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',      # Anonymous users
    'user': '1000/hour'      # Authenticated users
}
```

### 3. Input Validation
- Comprehensive validation on all serializers
- Protection against SQL injection through ORM
- XSS prevention through proper escaping
- CSRF protection enabled

### 4. Stock Management
- Real-time stock checking during order placement
- Prevents overselling
- Atomic transactions for stock updates

### 5. Data Integrity
- Foreign key constraints
- Unique constraints where appropriate
- Proper error handling and rollback

## Error Handling

### Standard Error Responses
```json
{
    "error": "Descriptive error message",
    "field_errors": {
        "field_name": ["Specific field error"]
    }
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (no permission)
- 404: Not Found
- 500: Internal Server Error

## Usage Examples

### Creating a Product (Admin Only)
```python
# POST /products/
{
    "title": "iPhone 15",
    "description": "Latest iPhone model with advanced features",
    "unit_price": "999.99",
    "stock": 50,
    "category": 1
}
```

### Adding a Review (Verified Users Only)
```python
# POST /products/1/reviews/
{
    "title": "Great product!",
    "content": "I really love this product. Highly recommended for everyone.",
    "rating": 5
}
```

### Placing an Order (Verified Users Only)
```python
# POST /api/orders/
{
    "cart": [
        {"product_id": 1, "quantity": 2},
        {"product_id": 3, "quantity": 1}
    ],
    "shipping_address": "123 Main St, City, State, ZIP Code"
}
```

## Testing Permissions

### Test Cases Implemented
1. **Unauthenticated Access**: Verify public endpoints work, private ones fail
2. **Unverified Users**: Ensure email verification is enforced
3. **Regular Users**: Can access own data, cannot access others'
4. **Admin Users**: Have elevated permissions for management operations
5. **Data Validation**: All serializers properly validate input data
6. **Edge Cases**: Handle edge cases like empty carts, insufficient stock

### Test Commands
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test products.tests
python manage.py test users.tests
python manage.py test orders.tests
```

## Future Enhancements

1. **Role-based Permissions**: Implement more granular role system
2. **API Versioning**: Add version control for API endpoints
3. **Advanced Rate Limiting**: Per-endpoint rate limiting
4. **Audit Logging**: Track all critical operations
5. **Data Encryption**: Encrypt sensitive data at rest
6. **Two-Factor Authentication**: Add 2FA for enhanced security

## Conclusion

This permissions and validation system provides:
- Comprehensive access control
- Robust data validation
- Protection against common attacks
- Clear separation of concerns
- Maintainable and scalable architecture

The implementation follows Django and DRF best practices while ensuring the security and integrity of the Amazon Clone application.

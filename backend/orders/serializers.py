from rest_framework import serializers
from django.core.validators import MinValueValidator
from decimal import Decimal
from .models import Order, OrderItem
from products.api.serializers import ProductSerializer
from users.models import User
from django.db.models import Sum

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model.
    This converts OrderItem database objects to/from JSON format.
    Used for API responses and requests involving order items.
    """
    
    # Include the full product details in the response (read-only)
    # This uses the ProductSerializer to nest complete product information
    product = ProductSerializer(read_only=True)
    
    # Include the calculated subtotal field (read-only)
    # This will automatically call the subtotal property from the model
    subtotal = serializers.ReadOnlyField()
    
    # Enhanced validation for quantity and price
    quantity = serializers.IntegerField(
        validators=[MinValueValidator(1)],
        error_messages={
            'invalid': 'Quantity must be a number.',
            'min_value': 'Quantity must be at least 1.'
        }
    )
    
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        error_messages={
            'invalid': 'Enter a valid price.',
            'min_value': 'Price must be greater than 0.'
        }
    )

    class Meta:
        model = OrderItem
        # Fields to include in serialization/deserialization
        fields = ['id', 'product', 'quantity', 'price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    """
    Main serializer for Order model.
    This provides complete order information including nested items.
    Used for general order operations and responses.
    """
    
    # Include all related order items using the OrderItemSerializer
    # many=True means there can be multiple items per order
    # read_only=True means items can't be created/updated through this serializer
    items = OrderItemSerializer(many=True, read_only=True)
    
    # Include the username from the related User model
    # source='user.username' tells DRF to get username from the user relationship
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    # Enhanced validation for shipping address
    shipping_address = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            'blank': 'Shipping address cannot be empty.',
            'required': 'Shipping address is required.'
        }
    )
    
    # Display formatted status
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        # All fields to include in the serialization
        fields = [
            'id', 'user', 'user_name', 'user_email', 'shipping_address', 
            'created_at', 'updated_at', 'is_paid', 'status', 'status_display',
            'total_amount', 'items'
        ]
        # Fields that can't be modified via API (automatically set by system)
        read_only_fields = ['user', 'created_at', 'updated_at', 'total_amount']
    
    def validate_shipping_address(self, value):
        """Validate shipping address format and content."""
        if not value or not value.strip():
            raise serializers.ValidationError("Shipping address cannot be empty.")
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Shipping address must be at least 10 characters long.")
        
        if len(value.strip()) > 500:
            raise serializers.ValidationError("Shipping address is too long (maximum 500 characters).")
        
        return value.strip()
    
    def validate_status(self, value):
        """Validate order status."""
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return value

class UserOrderHistorySerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user order history view.
    This provides a lighter response for listing orders (without full item details).
    Used when users want to see their order history quickly.
    """
    
    # Include order items but with full details
    items = OrderItemSerializer(many=True, read_only=True)
    
    # Count of items in the order without fetching all item details
    # source='items.count' uses Django's count() method on the relationship
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    # Display formatted status
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        # Minimal fields for quick overview of orders
        fields = [
            'id', 'created_at', 'status', 'status_display', 
            'total_amount', 'is_paid', 'items_count', 'items'
        ]

class AdminOrderSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for admin dashboard views.
    This includes additional user information and comprehensive order details.
    Only accessible by admin users for order management.
    """
    
    # Include all order items with full details
    items = OrderItemSerializer(many=True, read_only=True)
    
    # Include user email from the related User model
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    # Include username from the related User model
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    # Include user's full name
    user_full_name = serializers.SerializerMethodField()
    
    # Count of items in the order
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    # Display formatted status
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Enhanced validation for admin updates
    status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES,
        error_messages={
            'invalid_choice': 'Invalid status selected.'
        }
    )

    class Meta:
        model = Order
        # Comprehensive fields for admin management
        fields = [
            'id', 'user', 'user_email', 'user_name', 'user_full_name',
            'shipping_address', 'created_at', 'updated_at', 'is_paid', 
            'status', 'status_display', 'total_amount', 'items_count', 'items'
        ]
        # Allow admin to update these fields
        read_only_fields = ['user', 'created_at', 'updated_at', 'total_amount']
    
    def get_user_full_name(self, obj):
        """Return user's full name if available."""
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name if full_name else obj.user.username
        return "Unknown User"
    
    def validate(self, data):
        """Object-level validation for admin updates."""
        # Additional business logic validation can be added here
        # For example, prevent changing status if order is already delivered
        if self.instance and 'status' in data:
            current_status = self.instance.status
            new_status = data['status']
            
            # Example: Prevent changing from delivered back to processing
            if current_status == 'delivered' and new_status in ['pending', 'processing']:
                raise serializers.ValidationError({
                    'status': 'Cannot change status from delivered to an earlier status.'
                })
        
        return data

class CartItemSerializer(serializers.Serializer):
    """
    Serializer for cart items when placing an order.
    This validates the structure of cart data sent by the frontend.
    """
    product_id = serializers.IntegerField(
        min_value=1,
        error_messages={
            'invalid': 'Product ID must be a number.',
            'min_value': 'Product ID must be greater than 0.'
        }
    )
    
    quantity = serializers.IntegerField(
        min_value=1,
        max_value=100,  # Reasonable maximum to prevent abuse
        error_messages={
            'invalid': 'Quantity must be a number.',
            'min_value': 'Quantity must be at least 1.',
            'max_value': 'Quantity cannot exceed 100 per item.'
        }
    )
    
    def validate_product_id(self, value):
        """Validate that the product exists."""
        from products.models import Product
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"Product with ID {value} does not exist.")
        return value

class PlaceOrderSerializer(serializers.Serializer):
    """
    Serializer for placing a new order.
    This validates the complete order data including cart items and shipping address.
    """
    cart = CartItemSerializer(many=True)
    shipping_address = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            'blank': 'Shipping address cannot be empty.',
            'required': 'Shipping address is required.'
        }
    )
    
    def validate_cart(self, value):
        """Validate cart items."""
        if not value:
            raise serializers.ValidationError("Cart cannot be empty.")
        
        if len(value) > 50:  # Reasonable limit
            raise serializers.ValidationError("Too many items in cart (maximum 50).")
        
        # Check for duplicate products
        product_ids = [item['product_id'] for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("Duplicate products in cart. Please combine quantities.")
        
        return value
    
    def validate_shipping_address(self, value):
        """Validate shipping address."""
        if not value or not value.strip():
            raise serializers.ValidationError("Shipping address cannot be empty.")
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Shipping address must be at least 10 characters long.")
        
        if len(value.strip()) > 500:
            raise serializers.ValidationError("Shipping address is too long (maximum 500 characters).")
        
        return value.strip()
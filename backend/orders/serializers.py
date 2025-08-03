from rest_framework import serializers
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

    class Meta:
        model = Order
        # All fields to include in the serialization
        fields = ['id', 'user', 'user_name', 'shipping_address', 'created_at', 'updated_at', 'is_paid', 'status', 'total_amount', 'items']
        # Fields that can't be modified via API (automatically set by system)
        read_only_fields = ['user', 'created_at', 'updated_at', 'total_amount']

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

    class Meta:
        model = Order
        # Minimal fields for quick overview of orders
        fields = ['id', 'created_at', 'status', 'total_amount', 'is_paid', 'items_count', 'items']

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
    
    # Count of items in the order
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        # Comprehensive fields for admin management
        fields = [
            'id', 'user', 'user_email', 'user_name', 'shipping_address', 
            'created_at', 'updated_at', 'is_paid', 'status', 'total_amount', 
            'items_count', 'items'
        ]
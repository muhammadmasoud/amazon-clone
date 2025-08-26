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
        fields = [
            'id', 'product', 'quantity', 'price', 'subtotal', 
            'product_title', 'product_sku', 'is_fulfilled', 
            'fulfilled_at', 'created_at'
        ]

class PlaceOrderSerializer(serializers.Serializer):
    """
    Serializer for placing new orders from cart
    """
    cart = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        help_text="List of cart items with product_id and quantity"
    )
    shipping_address = serializers.CharField(max_length=500)
    shipping_city = serializers.CharField(max_length=100, required=False)
    shipping_state = serializers.CharField(max_length=100, required=False)
    shipping_zip = serializers.CharField(max_length=20, required=False)
    shipping_country = serializers.CharField(max_length=100, default='USA')
    shipping_phone = serializers.CharField(max_length=20, required=False)
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHOD_CHOICES,
        default='cash_on_delivery'
    )
    customer_notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    promo_code = serializers.CharField(max_length=50, required=False, allow_blank=True)

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
    
    # Additional calculated fields
    items_count = serializers.ReadOnlyField()
    status_display = serializers.ReadOnlyField()
    estimated_delivery_days = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    can_be_returned = serializers.ReadOnlyField()

    class Meta:
        model = Order
        # All fields to include in the serialization
        fields = [
            'id', 'order_number', 'user', 'user_name', 'shipping_address',
            'shipping_city', 'shipping_state', 'shipping_zip', 'shipping_country',
            'shipping_phone', 'created_at', 'updated_at', 'confirmed_at',
            'shipped_at', 'delivered_at', 'is_paid', 'payment_method',
            'payment_date', 'status', 'status_display', 'subtotal',
            'shipping_cost', 'tax_amount', 'discount_amount', 'total_amount',
            'customer_notes', 'admin_notes', 'tracking_number', 'courier_service',
            'promo_code', 'items', 'items_count', 'estimated_delivery_days',
            'can_be_cancelled', 'can_be_returned'
        ]
        # Fields that can't be modified via API (automatically set by system)
        read_only_fields = [
            'user', 'order_number', 'created_at', 'updated_at', 'confirmed_at',
            'shipped_at', 'delivered_at', 'payment_date'
        ]

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
    
    # Additional fields for better UX
    status_display = serializers.ReadOnlyField()
    estimated_delivery_days = serializers.ReadOnlyField()

    class Meta:
        model = Order
        # Minimal fields for quick overview of orders
        fields = [
            'id', 'order_number', 'created_at', 'updated_at', 'status', 
            'status_display', 'total_amount', 'is_paid', 'payment_method',
            'items_count', 'items', 'estimated_delivery_days', 'tracking_number'
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
    
    # Count of items in the order
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    # Additional admin fields
    status_display = serializers.ReadOnlyField()

    class Meta:
        model = Order
        # Comprehensive fields for admin management
        fields = [
            'id', 'order_number', 'user', 'user_email', 'user_name', 
            'shipping_address', 'shipping_city', 'shipping_state', 
            'shipping_zip', 'shipping_country', 'shipping_phone',
            'created_at', 'updated_at', 'confirmed_at', 'shipped_at', 
            'delivered_at', 'is_paid', 'payment_method', 'payment_date',
            'status', 'status_display', 'subtotal', 'shipping_cost',
            'tax_amount', 'discount_amount', 'total_amount', 'customer_notes',
            'admin_notes', 'tracking_number', 'courier_service', 'promo_code',
            'items_count', 'items'
        ]

class OrderStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating order status
    """
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    is_paid = serializers.BooleanField(required=False)
    tracking_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    courier_service = serializers.CharField(max_length=100, required=False, allow_blank=True)
    admin_notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)
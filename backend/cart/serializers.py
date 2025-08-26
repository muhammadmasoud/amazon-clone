from rest_framework import serializers
from .models import Cart, CartItem
from products.api.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    price_difference = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    price_when_added = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'quantity', 'subtotal', 'current_price', 
            'price_when_added', 'price_difference', 'is_available',
            'added_at', 'updated_at'
        ]

class CartSummarySerializer(serializers.ModelSerializer):
    """Lightweight cart serializer for quick overview"""
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ['id', 'total_items', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    shipping_cost = serializers.ReadOnlyField()
    tax_amount = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'total_items', 'subtotal', 'shipping_cost',
            'tax_amount', 'discount_amount', 'promo_code', 'total_amount',
            'items_count', 'created_at', 'updated_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=999, default=1)
    
    def validate_product_id(self, value):
        from products.models import Product
        try:
            product = Product.objects.get(id=value)
            if product.stock <= 0:
                raise serializers.ValidationError("Product is out of stock")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")

class UpdateQuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=999)

class PromoCodeSerializer(serializers.Serializer):
    promo_code = serializers.CharField(max_length=50)


from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model
    """
    class Meta:
        model = Payment
        fields = [
            'payment_id',
            'amount',
            'currency',
            'payment_method',
            'status',
            'stripe_client_secret',
            'created_at',
            'paid_at',
        ]
        read_only_fields = [
            'payment_id',
            'stripe_client_secret',
            'created_at',
            'paid_at',
        ]

class CreatePaymentIntentSerializer(serializers.Serializer):
    """
    Serializer for creating payment intent
    """
    order_id = serializers.CharField()
    
    def validate_order_id(self, value):
        # Allow cart checkout special case
        if value == 'cart-checkout':
            return value
            
        # For existing orders, validate as integer
        try:
            order_id = int(value)
            from orders.models import Order
            order = Order.objects.get(id=order_id, user=self.context['request'].user)
            if hasattr(order, 'payment'):
                raise serializers.ValidationError("Order already has a payment associated")
            return order_id
        except ValueError:
            raise serializers.ValidationError("Invalid order ID format")
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")

class ConfirmPaymentSerializer(serializers.Serializer):
    """
    Serializer for confirming payment
    """
    payment_intent_id = serializers.CharField()
    payment_id = serializers.CharField()

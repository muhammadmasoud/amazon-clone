from django.db import models
from orders.models import Order
from users.models import User
import uuid

class Payment(models.Model):
    """
    Payment model to track all payment transactions
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('stripe', 'Stripe'),
        ('cash_on_delivery', 'Cash on Delivery'),
    ]

    # Primary identifiers
    payment_id = models.CharField(max_length=50, unique=True, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Relationships
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='stripe'
    )
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    
    # Stripe-specific fields
    stripe_client_secret = models.CharField(max_length=500, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Additional info
    failure_reason = models.TextField(blank=True, null=True)
    refund_reason = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.payment_id:
            self.payment_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"

    class Meta:
        ordering = ['-created_at']


from django.db import models
from users.models import User
from products.models import Product
from decimal import Decimal
import uuid

class Order(models.Model):
    """
    Order model represents a customer's order in the e-commerce system.
    Each order belongs to a user and contains multiple order items.
    """
    
    # Define possible order statuses as choices
    # This ensures data consistency and provides a dropdown in admin
    STATUS_CHOICES = [
        ('pending', 'Pending'),        # Order placed but not processed
        ('confirmed', 'Confirmed'),    # Order confirmed by admin
        ('processing', 'Processing'),  # Order is being prepared
        ('packed', 'Packed'),          # Order has been packed
        ('shipped', 'Shipped'),        # Order has been shipped
        ('out_for_delivery', 'Out for Delivery'),  # Order is out for delivery
        ('delivered', 'Delivered'),    # Order has been delivered
        ('cancelled', 'Cancelled'),    # Order has been cancelled
        ('returned', 'Returned'),      # Order has been returned
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash_on_delivery', 'Cash on Delivery'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
        ('stripe', 'Stripe'),
    ]
    
    # Unique order number for customer reference
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    
    # Foreign key to User - each order belongs to one user
    # CASCADE means if user is deleted, their orders are also deleted
    # related_name='orders' allows us to access user.orders.all()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Enhanced shipping information
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_zip = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=100, default='USA')
    
    # Contact information
    shipping_phone = models.CharField(max_length=20, blank=True)
    
    # Order timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Payment information
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES, 
        default='cash_on_delivery'
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Financial details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Order notes
    customer_notes = models.TextField(blank=True, help_text="Special instructions from customer")
    admin_notes = models.TextField(blank=True, help_text="Internal notes for admin")
    
    # Tracking information
    tracking_number = models.CharField(max_length=100, blank=True)
    courier_service = models.CharField(max_length=100, blank=True)
    
    # Promo code used
    promo_code = models.CharField(max_length=50, blank=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        """String representation of the order for admin and debugging"""
        return f"Order {self.order_number} by {self.user.username}"

    def calculate_total(self):
        """
        Calculate the total amount of the order by summing all order items.
        This method iterates through all related OrderItems and calculates
        the total cost (quantity × price for each item).
        """
        # Calculate subtotal from order items
        items_total = sum(item.quantity * item.price for item in self.items.all())
        self.subtotal = items_total
        
        # Calculate total with shipping, tax, and discount
        self.total_amount = self.subtotal + self.shipping_cost + self.tax_amount - self.discount_amount
        
        self.save()
        return self.total_amount

    def items_count(self):
        """Return total number of items in the order"""
        return sum(item.quantity for item in self.items.all())

    def can_be_cancelled(self):
        """Check if order can be cancelled"""
        return self.status in ['pending', 'confirmed']

    def can_be_returned(self):
        """Check if order can be returned"""
        return self.status == 'delivered'

    @property 
    def status_display(self):
        """Get human-readable status"""
        return dict(self.STATUS_CHOICES).get(self.status, self.status)

    @property
    def estimated_delivery_days(self):
        """Estimate delivery days based on status"""
        status_days = {
            'pending': 7,
            'confirmed': 6,
            'processing': 5,
            'packed': 4,
            'shipped': 3,
            'out_for_delivery': 1,
            'delivered': 0,
        }
        return status_days.get(self.status, 7)

    class Meta:
        """
        Meta class defines metadata for the model.
        ordering = ['-created_at'] means orders will be sorted by creation date,
        newest first (the minus sign indicates descending order).
        """
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

class OrderItem(models.Model):
    """
    OrderItem represents individual products within an order.
    Each OrderItem contains one product with a specific quantity and price.
    This design allows tracking the price at the time of purchase.
    """
    
    # Foreign key to Order - each item belongs to one order
    # related_name='items' allows us to access order.items.all()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Foreign key to Product - each item references one product
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Positive integer for quantity (can't be negative)
    quantity = models.PositiveIntegerField()
    
    # Price at the time of order (important for price history)
    # We store the price here so if product price changes later,
    # the order still shows the original price paid
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Store product details at time of order (for historical record)
    product_title = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100, blank=True)
    
    # Item-specific status (for partial fulfillment)
    is_fulfilled = models.BooleanField(default=False)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Store product details at time of order
        if not self.product_title:
            self.product_title = self.product.title
        super().save(*args, **kwargs)

    def __str__(self):
        """String representation showing quantity and product name"""
        return f"{self.quantity} x {self.product_title}"

    @property
    def subtotal(self):
        """
        Property method to calculate subtotal for this item.
        @property decorator makes this accessible like an attribute: item.subtotal
        Returns quantity multiplied by price.
        """
        return self.quantity * self.price

    class Meta:
        ordering = ['id']
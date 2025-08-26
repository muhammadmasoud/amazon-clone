from django.db import models
from users.models import User
from products.models import Product
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Add promo code support
    promo_code = models.CharField(max_length=50, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def total_items(self):
        """Return total number of items in cart"""
        return sum(item.quantity for item in self.items.all())
    
    def subtotal(self):
        """Return subtotal before shipping and tax"""
        return sum(item.subtotal() for item in self.items.all())
    
    def shipping_cost(self):
        """Calculate shipping cost based on subtotal"""
        subtotal = self.subtotal()
        if subtotal >= 100:  # Free shipping over $100
            return Decimal('0.00')
        elif subtotal > 0:
            return Decimal('10.00')
        return Decimal('0.00')
    
    def tax_amount(self):
        """Calculate tax (10% of subtotal)"""
        return (self.subtotal() * Decimal('0.10')).quantize(Decimal('0.01'))
    
    def total_amount(self):
        """Calculate final total including shipping, tax, and discount"""
        subtotal = self.subtotal()
        shipping = self.shipping_cost()
        tax = self.tax_amount()
        discount = self.discount_amount or Decimal('0')
        return max(subtotal + shipping + tax - discount, Decimal('0'))

    def __str__(self):
        return f"Cart for {self.user.username} ({self.total_items()} items)"

    class Meta:
        ordering = ['-updated_at']

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(
        default=1, 
        validators=[MinValueValidator(1), MaxValueValidator(999)]
    )
    # Store price at the time of adding to cart (for price protection)
    price_when_added = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Store current product price when first added
        if not self.price_when_added:
            self.price_when_added = self.product.unit_price
        super().save(*args, **kwargs)

    def current_price(self):
        """Get current product price"""
        return self.product.unit_price

    def price_difference(self):
        """Calculate price difference since added to cart"""
        if self.price_when_added:
            return self.current_price() - self.price_when_added
        return Decimal('0')

    def subtotal(self):
        """Calculate subtotal using current product price"""
        return self.current_price() * self.quantity

    def is_available(self):
        """Check if product is still available and in stock"""
        return self.product.stock >= self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['-added_at']

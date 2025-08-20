from django.db import models
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock = models.PositiveSmallIntegerField(default=0, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products',null=True)

    def average_rating(self):
        """
        Calculates and returns the average rating for this product from all its reviews.
        Returns 0 if there are no reviews.
        """
        # The 'reviews' related_name allows us to do: self.reviews.all()
        result = self.reviews.aggregate(average=Avg('rating'))
        # The aggregate function returns a dictionary like {'average': 4.75} or {'average': None}
        return result['average'] if result['average'] is not None else 0

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-date_added']

class Review(models.Model):
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name='reviews')
    #A lot of changes later!
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE, 
        null=True,#Change Later
        blank=True,#Change Later
        related_name='reviews'
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review for {self.product.title}, Review Title: {self.title} - {self.rating}/5"
    
    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'product'],
                name='unique_user_product_review'
            )
        ]

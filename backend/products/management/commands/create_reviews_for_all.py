from django.core.management.base import BaseCommand
from products.models import Product, Review
from users.models import User
import random

class Command(BaseCommand):
    help = 'Create reviews for all products that don\'t have reviews yet'

    def handle(self, *args, **options):
        # Get all products without reviews
        products_without_reviews = Product.objects.exclude(
            id__in=Review.objects.values_list('product_id', flat=True)
        ).distinct()
        
        print(f"Found {products_without_reviews.count()} products without reviews")
        
        # Get or create some users for reviews
        users = []
        for i in range(10):
            username = f"reviewer_{i+1}"
            email = f"reviewer{i+1}@example.com"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': f'Reviewer',
                    'last_name': f'{i+1}'
                }
            )
            users.append(user)
        
        review_texts = [
            "Great product! Exactly what I was looking for.",
            "Good quality and fast shipping. Recommended!",
            "Average product, does the job but nothing special.",
            "Excellent value for money. Very satisfied!",
            "Not bad, but could be better. Decent quality.",
            "Outstanding! Exceeded my expectations.",
            "Pretty good product, would buy again.",
            "Okay product, met my basic needs.",
            "Amazing quality! Love it!",
            "Good product overall, happy with purchase.",
            "Solid build quality and great features.",
            "Works as expected, good value.",
            "Impressive product, highly recommend!",
            "Nice product, good for the price.",
            "Decent quality, arrived quickly."
        ]
        
        created_reviews = 0
        
        for product in products_without_reviews:
            # Create 2-5 reviews per product
            num_reviews = random.randint(2, 5)
            
            for _ in range(num_reviews):
                user = random.choice(users)
                rating = random.choices(
                    [1, 2, 3, 4, 5],
                    weights=[5, 10, 15, 35, 35]  # Weighted towards higher ratings
                )[0]
                comment = random.choice(review_texts)
                
                # Check if this user already reviewed this product
                if not Review.objects.filter(product=product, user=user).exists():
                    Review.objects.create(
                        product=product,
                        user=user,
                        rating=rating,
                        comment=comment
                    )
                    created_reviews += 1
        
        total_reviews = Review.objects.count()
        print(f"Created {created_reviews} new reviews")
        print(f"Total reviews in database: {total_reviews}")
        
        # Show rating distribution
        for rating in range(1, 6):
            count = Review.objects.filter(rating=rating).count()
            print(f"{rating}-star reviews: {count}")

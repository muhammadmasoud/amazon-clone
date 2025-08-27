from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product, Review
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample reviews for the new products'

    def handle(self, *args, **options):
        # Create sample users for reviews
        reviewers = []
        for i in range(5):
            username = f'reviewer{i+1}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'first_name': f'John',
                    'last_name': f'Doe{i+1}',
                    'mobile': f'555000{i:04d}',
                }
            )
            if created:
                user.set_password('reviewpass123')
                user.save()
            reviewers.append(user)

        # Sample review data
        positive_reviews = [
            ("Excellent quality!", "This product exceeded my expectations. Great build quality and performance.", 5),
            ("Love it!", "Amazing product! Works perfectly and looks great.", 5),
            ("Highly recommend", "Perfect for my needs. Would definitely buy again.", 5),
            ("Great value", "Good quality for the price. Very satisfied with purchase.", 4),
            ("Works well", "Does exactly what it's supposed to do. Happy with it.", 4),
        ]
        
        good_reviews = [
            ("Pretty good", "Good product overall. Minor issues but mostly satisfied.", 4),
            ("Solid choice", "Works as expected. Good build quality.", 4),
            ("Satisfied", "Does the job well. No major complaints.", 4),
            ("Good purchase", "Happy with this buy. Meets my expectations.", 4),
        ]
        
        average_reviews = [
            ("It's okay", "Average product. Does what it says but nothing special.", 3),
            ("Could be better", "Works but has some limitations. Acceptable for the price.", 3),
        ]

        products = Product.objects.all()
        created_reviews = 0

        for product in products:
            # Each product gets 3-6 reviews
            num_reviews = random.randint(3, 6)
            used_reviewers = []
            
            for _ in range(num_reviews):
                # Don't let same user review same product twice
                available_reviewers = [r for r in reviewers if r not in used_reviewers]
                if not available_reviewers:
                    break
                
                reviewer = random.choice(available_reviewers)
                used_reviewers.append(reviewer)
                
                # Choose review type (mostly positive for better ratings)
                review_type = random.choices(
                    [positive_reviews, good_reviews, average_reviews],
                    weights=[70, 25, 5]  # 70% positive, 25% good, 5% average
                )[0]
                
                title, content, rating = random.choice(review_type)
                
                Review.objects.create(
                    product=product,
                    user=reviewer,
                    title=title,
                    content=content,
                    rating=rating
                )
                created_reviews += 1

        self.stdout.write(
            self.style.SUCCESS(f'Created {created_reviews} reviews for {products.count()} products')
        )

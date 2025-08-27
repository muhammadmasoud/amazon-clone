from django.core.management.base import BaseCommand
from products.models import Product, Review
from django.db.models import Avg, Q

class Command(BaseCommand):
    help = 'Test rating filter for duplicates'

    def handle(self, *args, **options):
        self.stdout.write("Testing rating filter for duplicates...")
        
        # Test different rating filters
        for min_rating in [1, 2, 3, 4, 5]:
            self.stdout.write(f"\nTesting min_rating={min_rating}:")
            
            # Query without distinct
            products_without_distinct = Product.objects.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(
                Q(avg_rating__gte=min_rating) | Q(avg_rating__isnull=True, reviews__isnull=True)
            )
            
            # Query with distinct
            products_with_distinct = Product.objects.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(
                Q(avg_rating__gte=min_rating) | Q(avg_rating__isnull=True, reviews__isnull=True)
            ).distinct()
            
            count_without = products_without_distinct.count()
            count_with = products_with_distinct.count()
            
            self.stdout.write(f"  Without distinct: {count_without} results")
            self.stdout.write(f"  With distinct: {count_with} results")
            
            if count_without != count_with:
                self.stdout.write(f"  ⚠️ Found {count_without - count_with} duplicates!")
                
                # Show the first few products to verify
                self.stdout.write("  First 5 products:")
                for product in products_with_distinct[:5]:
                    avg_rating = product.avg_rating or "No reviews"
                    self.stdout.write(f"    - {product.title} (avg rating: {avg_rating})")
            else:
                self.stdout.write("  ✅ No duplicates found")
        
        self.stdout.write(f"\nTotal products in database: {Product.objects.count()}")
        self.stdout.write(f"Total reviews in database: {Review.objects.count()}")

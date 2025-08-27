from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Product, Review
from collections import defaultdict
import os

class Command(BaseCommand):
    help = 'Remove duplicate products and products with same images'

    def handle(self, *args, **options):
        self.stdout.write("Starting duplicate removal process...")
        
        initial_count = Product.objects.count()
        self.stdout.write(f"Initial product count: {initial_count}")
        
        # Dictionary to track products by title
        products_by_title = defaultdict(list)
        
        # Group products by title
        for product in Product.objects.all():
            products_by_title[product.title].append(product)
        
        # Dictionary to track products by image
        products_by_image = defaultdict(list)
        
        # Group products by image path
        for product in Product.objects.all():
            if product.image:
                image_path = product.image.name
                products_by_image[image_path].append(product)
        
        duplicates_removed = 0
        
        with transaction.atomic():
            # Remove duplicate titles - keep the first one (usually has more reviews)
            for title, products in products_by_title.items():
                if len(products) > 1:
                    self.stdout.write(f"Found {len(products)} products with title: {title}")
                    
                    # Sort by number of reviews (descending), then by ID (ascending)
                    products.sort(key=lambda p: (-p.reviews.count(), p.id))
                    
                    # Keep the first one (most reviews), delete the rest
                    product_to_keep = products[0]
                    products_to_delete = products[1:]
                    
                    self.stdout.write(f"  Keeping product ID {product_to_keep.id} (has {product_to_keep.reviews.count()} reviews)")
                    
                    for product in products_to_delete:
                        self.stdout.write(f"  Deleting product ID {product.id} (has {product.reviews.count()} reviews)")
                        
                        # Delete the image file if it exists and no other product uses it
                        if product.image:
                            image_path = product.image.path
                            # Check if any other product uses this image
                            other_products_with_image = Product.objects.filter(
                                image=product.image.name
                            ).exclude(id=product.id)
                            
                            if not other_products_with_image.exists():
                                try:
                                    if os.path.exists(image_path):
                                        os.remove(image_path)
                                        self.stdout.write(f"    Deleted image file: {image_path}")
                                except Exception as e:
                                    self.stdout.write(f"    Error deleting image: {e}")
                        
                        # Delete the product (this will also delete associated reviews due to CASCADE)
                        product.delete()
                        duplicates_removed += 1
            
            # Remove products with duplicate images (keep the one with more reviews)
            for image_path, products in products_by_image.items():
                if len(products) > 1:
                    self.stdout.write(f"Found {len(products)} products with image: {image_path}")
                    
                    # Sort by number of reviews (descending), then by ID (ascending)
                    products.sort(key=lambda p: (-p.reviews.count(), p.id))
                    
                    # Keep the first one (most reviews), delete the rest
                    product_to_keep = products[0]
                    products_to_delete = products[1:]
                    
                    self.stdout.write(f"  Keeping product ID {product_to_keep.id} ({product_to_keep.title})")
                    
                    for product in products_to_delete:
                        # Only delete if this product still exists (might have been deleted in title cleanup)
                        if Product.objects.filter(id=product.id).exists():
                            self.stdout.write(f"  Deleting product ID {product.id} ({product.title})")
                            product.delete()
                            duplicates_removed += 1
        
        final_count = Product.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Cleanup complete!\n'
                f'Products before: {initial_count}\n'
                f'Products after: {final_count}\n'
                f'Duplicates removed: {duplicates_removed}'
            )
        )
        
        # Show category distribution
        from products.models import Category
        self.stdout.write("\nFinal category distribution:")
        for category in Category.objects.all():
            count = Product.objects.filter(category=category).count()
            if count > 0:
                self.stdout.write(f"  {category.name}: {count} products")
        
        # Show total reviews
        total_reviews = Review.objects.count()
        self.stdout.write(f"\nTotal reviews remaining: {total_reviews}")

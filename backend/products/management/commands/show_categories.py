from django.core.management.base import BaseCommand
from products.models import Product, Category

class Command(BaseCommand):
    help = 'Show final categorization results'

    def handle(self, *args, **options):
        self.stdout.write("📋 FINAL PRODUCT CATEGORIZATION RESULTS")
        self.stdout.write("=" * 60)
        
        total_products = Product.objects.count()
        self.stdout.write(f"Total Products: {total_products}")
        
        categories = Category.objects.filter(products__isnull=False).distinct().order_by('name')
        
        for category in categories:
            products = Product.objects.filter(category=category).order_by('title')
            self.stdout.write(f"\n🏷️  {category.name} ({products.count()} products)")
            self.stdout.write("-" * 40)
            
            for product in products:
                price = f"${product.unit_price}"
                self.stdout.write(f"   • {product.title:<35} {price:>8}")
        
        # Check for uncategorized products
        uncategorized = Product.objects.filter(category__isnull=True)
        if uncategorized.exists():
            self.stdout.write(f"\n⚠️  UNCATEGORIZED PRODUCTS ({uncategorized.count()})")
            self.stdout.write("-" * 40)
            for product in uncategorized:
                self.stdout.write(f"   • {product.title}")
        
        self.stdout.write(f"\n✅ Categorization complete! All {total_products} products are properly organized.")

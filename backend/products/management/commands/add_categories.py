from django.core.management.base import BaseCommand
from products.models import Category

class Command(BaseCommand):
    help = 'Add all the main categories to the database'

    def handle(self, *args, **options):
        self.stdout.write("🏷️  Adding categories to the database...")
        
        # List of categories from the image
        categories = [
            "Electronics",
            "Gaming",
            "Home & Kitchen",
            "Sports & Fitness",
            "Automotive",
            "Computers & Laptops",
            "Mobile & Tablets",
            "Audio & Headphones",
            "Smart Home",
            "Clothing & Shoes",
            "Books & Entertainment"
        ]
        
        created_count = 0
        existing_count = 0
        
        for category_name in categories:
            category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Products in the {category_name} category'}
            )
            
            if created:
                self.stdout.write(f"✅ Created: {category_name}")
                created_count += 1
            else:
                self.stdout.write(f"ℹ️  Already exists: {category_name}")
                existing_count += 1
        
        self.stdout.write(f"\n🎉 Categories setup complete!")
        self.stdout.write(f"✅ Created: {created_count}")
        self.stdout.write(f"ℹ️  Already existed: {existing_count}")
        self.stdout.write(f"📊 Total categories: {Category.objects.count()}")
        
        # Show all categories
        self.stdout.write(f"\n📋 All categories in database:")
        self.stdout.write("-" * 40)
        for category in Category.objects.all().order_by('name'):
            self.stdout.write(f"   • {category.name}")

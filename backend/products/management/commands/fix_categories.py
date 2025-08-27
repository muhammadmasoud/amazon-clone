from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Product, Category

class Command(BaseCommand):
    help = 'Fix product categories to be more accurate'

    def handle(self, *args, **options):
        self.stdout.write("Starting category correction process...")
        
        # First, let's see what we have
        products = Product.objects.all()
        self.stdout.write(f"Total products to categorize: {products.count()}")
        
        # Create better category structure
        categories_to_create = {
            'Computers & Laptops': 'Laptops, desktops, and computer accessories',
            'Mobile & Tablets': 'Smartphones, tablets, and mobile accessories', 
            'Audio & Headphones': 'Headphones, earbuds, and audio equipment',
            'Gaming': 'Gaming consoles, accessories, and gaming gear',
            'Smart Home': 'Smart home devices and IoT products',
            'Home & Kitchen': 'Kitchen appliances and home essentials',
            'Sports & Fitness': 'Exercise equipment and sports gear',
            'Clothing & Shoes': 'Apparel, footwear, and fashion accessories',
            'Books & Entertainment': 'Books, subscriptions, and digital content',
            'Automotive': 'Car accessories and automotive products',
            'Health & Personal Care': 'Health and personal care products'
        }
        
        # Create categories if they don't exist
        created_categories = {}
        for name, description in categories_to_create.items():
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            created_categories[name] = category
            if created:
                self.stdout.write(f"Created category: {name}")
        
        # Define accurate product categorization
        product_categories = {
            # Computers & Laptops
            'Computers & Laptops': [
                'MacBook Air M2',
                'Dell XPS 13 Laptop',
                'Gaming Laptop Pro',
                'Microsoft Surface Pro 9'
            ],
            
            # Mobile & Tablets  
            'Mobile & Tablets': [
                'iPhone 15 Pro',
                'Google Pixel 8 Pro',
                'Samsung Galaxy Tab S9',
                'iPad Air 5th Generation'
            ],
            
            # Audio & Headphones
            'Audio & Headphones': [
                'Sony WH-1000XM5 Headphones',
                'Bose QuietComfort Earbuds',
                'SteelSeries Arctis 7P',
                'Audio-Technica ATH-M50x'
            ],
            
            # Gaming
            'Gaming': [
                'Sony PlayStation 5',
                'Nintendo Switch OLED',
                'Razer DeathAdder V3'
            ],
            
            # Smart Home
            'Smart Home': [
                'Nest Thermostat',
                'Ring Video Doorbell Pro',
                'Philips Hue Smart Bulbs 4-Pack'
            ],
            
            # Home & Kitchen
            'Home & Kitchen': [
                'Instant Pot Duo Plus',
                'KitchenAid Stand Mixer',
                'Vitamix E310 Blender',
                'Dyson V15 Detect',
                'Shark Robot Vacuum',
                'Lodge Cast Iron Skillet',
                'Keurig K-Supreme Coffee Maker'
            ],
            
            # Sports & Fitness
            'Sports & Fitness': [
                'Peloton Bike+',
                'Bowflex Adjustable Dumbbells',
                'Yoga Mat Premium',
                'Resistance Bands Set',
                'Garmin Forerunner 255',
                'Apple Watch Series 9'
            ],
            
            # Clothing & Shoes
            'Clothing & Shoes': [
                'Levi\'s 501 Original Jeans',
                'Nike Air Force 1 Sneakers',
                'Patagonia Fleece Jacket',
                'Ray-Ban Aviator Sunglasses',
                'Champion Hoodie',
                'Adidas Ultraboost 22',
                'Calvin Klein T-Shirt Pack',
                'The North Face Backpack',
                'Timex Weekender Watch',
                'Converse Chuck Taylor All Star'
            ],
            
            # Books & Entertainment
            'Books & Entertainment': [
                'Atomic Habits Book',
                'Spotify Premium 12 Months',
                'Netflix Gift Card $50',
                'Programming Books Bundle',
                'Audible Subscription 6 Months',
                'Kindle Paperwhite'
            ],
            
            # Automotive
            'Automotive': [
                'Dash Cam 4K',
                'Car Phone Mount',
                'Car Vacuum Cleaner',
                'Car Air Freshener Set',
                'Jump Starter Power Bank'
            ],
            
            # Smart Home (additional electronics)
            'Smart Home': [
                'GoPro Hero 12 Black'  # Action camera can be smart home/security
            ]
        }
        
        updated_count = 0
        
        with transaction.atomic():
            # Apply the categorization
            for category_name, product_titles in product_categories.items():
                category = created_categories[category_name]
                
                for title in product_titles:
                    try:
                        product = Product.objects.get(title=title)
                        old_category = product.category.name if product.category else "None"
                        
                        if product.category != category:
                            product.category = category
                            product.save()
                            updated_count += 1
                            self.stdout.write(f"✅ {title}: {old_category} → {category_name}")
                        else:
                            self.stdout.write(f"✓ {title}: Already in {category_name}")
                            
                    except Product.DoesNotExist:
                        self.stdout.write(f"❌ Product not found: {title}")
            
            # Handle any uncategorized products
            uncategorized = Product.objects.filter(category__isnull=True)
            if uncategorized.exists():
                self.stdout.write(f"\n⚠️  Found {uncategorized.count()} uncategorized products:")
                for product in uncategorized:
                    self.stdout.write(f"  - {product.title}")
        
        self.stdout.write(f"\n🎉 Category update complete!")
        self.stdout.write(f"Updated {updated_count} products")
        
        # Show final category distribution
        self.stdout.write(f"\n📊 Final category distribution:")
        for category in Category.objects.all():
            count = Product.objects.filter(category=category).count()
            if count > 0:
                self.stdout.write(f"  {category.name}: {count} products")
        
        # Clean up empty categories
        empty_categories = Category.objects.filter(products__isnull=True)
        if empty_categories.exists():
            self.stdout.write(f"\n🧹 Cleaning up {empty_categories.count()} empty categories...")
            for cat in empty_categories:
                self.stdout.write(f"  Deleted: {cat.name}")
                cat.delete()

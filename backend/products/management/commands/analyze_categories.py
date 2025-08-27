from django.core.management.base import BaseCommand
from products.models import Product, Category

class Command(BaseCommand):
    help = 'Analyze and fix product categories'

    def handle(self, *args, **options):
        self.stdout.write("Analyzing current product categorization...")
        
        # Get all products
        products = Product.objects.all()
        
        self.stdout.write(f"Total products: {products.count()}")
        self.stdout.write("\nCurrent product categorization:")
        
        for product in products:
            category_name = product.category.name if product.category else "No category"
            self.stdout.write(f"  {product.title} -> {category_name}")
        
        self.stdout.write("\n" + "="*80)
        self.stdout.write("CATEGORY ANALYSIS & RECOMMENDATIONS:")
        self.stdout.write("="*80)
        
        # Define proper category mappings
        category_mappings = {
            # Electronics & Tech
            'Electronics': [
                'MacBook Air M2',
                'Dell XPS 13 Laptop', 
                'Gaming Laptop Pro',
                'Samsung Galaxy Tab S9',
                'iPad Air 5th Generation',
                'Microsoft Surface Pro 9',
                'Google Pixel 8 Pro',
                'iPhone 15 Pro',
                'Kindle Paperwhite',
                'Nest Thermostat',
                'Ring Video Doorbell Pro',
                'Philips Hue Smart Bulbs 4-Pack'
            ],
            
            # Gaming & Entertainment
            'Gaming': [
                'Sony PlayStation 5',
                'Nintendo Switch OLED',
                'SteelSeries Arctis 7P',
                'Razer DeathAdder V3'
            ],
            
            # Audio Equipment
            'Audio': [
                'Sony WH-1000XM5 Headphones',
                'Bose QuietComfort Earbuds',
                'Audio-Technica ATH-M50x'
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
            
            # Fashion & Accessories
            'Fashion': [
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
            
            # Books & Media
            'Books & Media': [
                'Atomic Habits Book',
                'Spotify Premium 12 Months',
                'Netflix Gift Card $50',
                'Programming Books Bundle',
                'Audible Subscription 6 Months'
            ],
            
            # Automotive
            'Automotive': [
                'Dash Cam 4K',
                'Car Phone Mount',
                'Car Vacuum Cleaner',
                'Car Air Freshener Set',
                'Jump Starter Power Bank'
            ],
            
            # Cameras & Photography
            'Electronics': [  # Will be moved to a new Camera category if needed
                'GoPro Hero 12 Black'
            ]
        }
        
        # Show recommended mappings
        for category, product_list in category_mappings.items():
            self.stdout.write(f"\n{category}:")
            for product_name in product_list:
                try:
                    product = Product.objects.get(title=product_name)
                    current_category = product.category.name if product.category else "No category"
                    if current_category != category:
                        self.stdout.write(f"  ❌ {product_name} (currently: {current_category}) -> should be: {category}")
                    else:
                        self.stdout.write(f"  ✅ {product_name} (correctly categorized)")
                except Product.DoesNotExist:
                    self.stdout.write(f"  ⚠️  {product_name} (not found in database)")
        
        # Check for products not in our mapping
        self.stdout.write(f"\nProducts not in category mapping:")
        mapped_products = set()
        for product_list in category_mappings.values():
            mapped_products.update(product_list)
        
        for product in products:
            if product.title not in mapped_products:
                category_name = product.category.name if product.category else "No category"
                self.stdout.write(f"  ⚠️  {product.title} (current: {category_name})")
        
        self.stdout.write(f"\nWould you like to apply these category fixes? Run: python manage.py fix_categories")

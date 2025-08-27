from django.core.management.base import BaseCommand
from django.test import RequestFactory
from products.api.views import view_add_product
import json

class Command(BaseCommand):
    help = 'Test API for duplicates'

    def handle(self, *args, **options):
        self.stdout.write("Testing API for duplicates...")
        
        factory = RequestFactory()
        
        # Test rating filter
        request = factory.get('/api/products/', {'min_rating': '4'})
        response = view_add_product(request)
        
        if response.status_code == 200:
            data = response.data
            products = data.get('results', [])
            
            self.stdout.write(f"Response status: {response.status_code}")
            self.stdout.write(f"Number of products returned: {len(products)}")
            self.stdout.write(f"Total count from API: {data.get('count', 'N/A')}")
            
            # Check for duplicate IDs
            product_ids = [p['id'] for p in products]
            unique_ids = set(product_ids)
            
            if len(product_ids) == len(unique_ids):
                self.stdout.write("✅ No duplicate products found!")
            else:
                self.stdout.write(f"❌ Found {len(product_ids) - len(unique_ids)} duplicate products!")
                
                # Show which IDs are duplicated
                from collections import Counter
                id_counts = Counter(product_ids)
                duplicates = {id: count for id, count in id_counts.items() if count > 1}
                for product_id, count in duplicates.items():
                    product = next(p for p in products if p['id'] == product_id)
                    self.stdout.write(f"  - ID {product_id} ({product['title']}): appears {count} times")
            
            # Show first few products
            self.stdout.write(f"\nFirst 5 products:")
            for i, product in enumerate(products[:5]):
                self.stdout.write(f"  {i+1}. {product['title']} (ID: {product['id']})")
        else:
            self.stdout.write(f"❌ API returned error: {response.status_code}")
            self.stdout.write(f"Response: {response.data}")

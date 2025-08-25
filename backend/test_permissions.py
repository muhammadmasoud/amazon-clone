# Permission Testing Script
# Run this script to test if all permissions are working correctly

import requests
import json

BASE_URL = "http://localhost:8000"

def test_permissions():
    """Test all permission scenarios"""
    
    print("🔐 TESTING AMAZON CLONE PERMISSIONS")
    print("=" * 50)
    
    # Test 1: Public access to products (should work)
    print("\n1. Testing public access to products...")
    try:
        response = requests.get(f"{BASE_URL}/products/")
        if response.status_code == 200:
            print("✅ Public can view products")
        else:
            print(f"❌ Failed: {response.status_code}")
    except:
        print("❌ Server not running or endpoint not available")
    
    # Test 2: Unauthenticated user trying to create product (should fail)
    print("\n2. Testing unauthenticated product creation...")
    try:
        data = {
            "title": "Test Product",
            "description": "Test Description", 
            "unit_price": "10.00",
            "stock": 5,
            "category": 1
        }
        response = requests.post(f"{BASE_URL}/products/", json=data)
        if response.status_code in [401, 403]:
            print("✅ Unauthenticated users cannot create products")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
    except:
        print("❌ Server not running or endpoint not available")
    
    # Test 3: Public access to reviews (should work)
    print("\n3. Testing public access to reviews...")
    try:
        response = requests.get(f"{BASE_URL}/products/1/reviews/")
        if response.status_code in [200, 404]:  # 404 is ok if product doesn't exist
            print("✅ Public can view reviews")
        else:
            print(f"❌ Failed: {response.status_code}")
    except:
        print("❌ Server not running or endpoint not available")
    
    # Test 4: Unauthenticated user trying to create review (should fail)
    print("\n4. Testing unauthenticated review creation...")
    try:
        data = {
            "title": "Test Review",
            "content": "This is a test review",
            "rating": 5
        }
        response = requests.post(f"{BASE_URL}/products/1/reviews/", json=data)
        if response.status_code in [401, 403]:
            print("✅ Unauthenticated users cannot create reviews")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
    except:
        print("❌ Server not running or endpoint not available")
    
    # Test 5: Access to admin endpoints (should fail without admin)
    print("\n5. Testing admin-only endpoints...")
    try:
        response = requests.get(f"{BASE_URL}/api/admin/orders/")
        if response.status_code in [401, 403]:
            print("✅ Admin endpoints are protected")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
    except:
        print("❌ Server not running or endpoint not available")
    
    print("\n" + "=" * 50)
    print("🏁 PERMISSION TESTING COMPLETE")
    print("\nTo run full tests:")
    print("1. Start your Django server: python manage.py runserver")
    print("2. Run this script: python test_permissions.py")

if __name__ == "__main__":
    test_permissions()

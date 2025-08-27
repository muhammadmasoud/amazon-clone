import requests
import json

def test_price_range_endpoint():
    """Test the new price range endpoint"""
    try:
        response = requests.get('http://localhost:8000/api/products/price-range/')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing price range endpoint: {e}")
        return False

def test_price_filtering():
    """Test the price filtering functionality"""
    try:
        # Test with price filters
        response = requests.get('http://localhost:8000/api/products/', params={
            'min_price': 100,
            'max_price': 500
        })
        print(f"Price Filter Test - Status Code: {response.status_code}")
        data = response.json()
        print(f"Filtered Products Count: {data.get('count', 0)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing price filtering: {e}")
        return False

if __name__ == '__main__':
    print("Testing Price Range Endpoint...")
    test_price_range_endpoint()
    
    print("\nTesting Price Filtering...")
    test_price_filtering()
    
    print("\nTesting Products List...")
    try:
        response = requests.get('http://localhost:8000/api/products/')
        print(f"Products List - Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Products: {data.get('count', 0)}")
    except Exception as e:
        print(f"Error: {e}")

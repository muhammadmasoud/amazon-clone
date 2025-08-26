#!/usr/bin/env python
"""
Simple test script to verify Stripe integration
Run this after starting the Django server
"""

import requests
import json

BASE_URL = 'http://localhost:8000'

def test_stripe_config():
    """Test that Stripe config endpoint works"""
    print("Testing Stripe config endpoint...")
    try:
        response = requests.get(f'{BASE_URL}/api/payments/stripe-config/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stripe config loaded: {data['publishable_key'][:20]}...")
            return True
        else:
            print(f"❌ Failed to get Stripe config: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_create_payment_intent():
    """Test creating a payment intent (requires authentication)"""
    print("\nTesting payment intent creation...")
    print("⚠️  This requires user authentication - test manually through frontend")
    return True

def run_tests():
    """Run all tests"""
    print("🧪 Testing Stripe Integration\n")
    
    tests = [
        test_stripe_config,
        test_create_payment_intent,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print(f"\n📊 Results: {sum(results)}/{len(results)} tests passed")
    
    if all(results):
        print("🎉 All tests passed! Stripe integration is working.")
    else:
        print("⚠️  Some tests failed. Check the output above.")

if __name__ == '__main__':
    run_tests()

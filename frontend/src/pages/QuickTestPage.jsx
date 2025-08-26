import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickTestPage = () => {
  const navigate = useNavigate();

  const testAddToCart = () => {
    // Simulate adding items to cart by navigating to a product page
    // You can modify this to actually add items if you have product data
    alert('To test the full payment flow:\n\n1. Go to a product page\n2. Add items to cart\n3. Go to cart page\n4. Click "Proceed to Checkout"\n5. Choose Stripe payment\n6. Use test card: 4242 4242 4242 4242');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎉 Stripe Payment Integration Complete!
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Integration Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">✅ Backend Features</h3>
                <ul className="text-sm space-y-1">
                  <li>• Stripe Payment Intent API</li>
                  <li>• Payment tracking models</li>
                  <li>• Webhook handling</li>
                  <li>• Order integration</li>
                  <li>• Admin interface</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">✅ Frontend Features</h3>
                <ul className="text-sm space-y-1">
                  <li>• Stripe React Elements</li>
                  <li>• Payment form validation</li>
                  <li>• Loading states</li>
                  <li>• Error handling</li>
                  <li>• Success confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🧪 How to Test</h3>
            <div className="text-sm text-blue-800 space-y-2 text-left">
              <p><strong>1. Add products to cart:</strong> Browse products and add them to your cart</p>
              <p><strong>2. Go to checkout:</strong> Click "Proceed to Checkout" from cart page</p>
              <p><strong>3. Choose payment method:</strong> Select "Credit/Debit Card" (Stripe)</p>
              <p><strong>4. Enter test card:</strong> Use 4242 4242 4242 4242</p>
              <p><strong>5. Complete payment:</strong> Fill in any future date and CVC</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">🔑 Test Card Numbers</h3>
            <div className="text-sm text-yellow-800 space-y-1 font-mono">
              <p><strong>Success:</strong> 4242 4242 4242 4242</p>
              <p><strong>Visa Debit:</strong> 4000 0566 5566 5556</p>
              <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p className="mt-2 text-xs"><em>Any future expiry date, any 3-digit CVC</em></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                🛍️ Start Shopping
              </button>
              
              <button
                onClick={() => navigate('/cart')}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                🛒 Go to Cart
              </button>
            </div>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
            >
              💳 Try Direct Checkout
            </button>

            <button
              onClick={testAddToCart}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
            >
              ℹ️ How to Test Payment Flow
            </button>
          </div>

          <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🚀 Next Steps:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Production:</strong> Replace test keys with live Stripe keys</li>
              <li>• <strong>Webhooks:</strong> Set up webhook endpoints for order confirmations</li>
              <li>• <strong>Testing:</strong> Test with real products in your cart</li>
              <li>• <strong>UI:</strong> Customize the payment forms to match your design</li>
              <li>• <strong>Features:</strong> Add order tracking and email notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTestPage;

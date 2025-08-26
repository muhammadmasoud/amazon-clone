import React from 'react';
import { useNavigate } from 'react-router-dom';

const StripeTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Stripe Payment Integration Test
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Options Available
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Stripe Credit Card Payment</h3>
                <p className="text-green-800 text-sm">
                  Secure card payments with test mode enabled
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">✅ Cash on Delivery</h3>
                <p className="text-blue-800 text-sm">
                  Traditional payment method for local deliveries
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">🧪 Test Card Numbers</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>Visa:</strong> 4242 4242 4242 4242</p>
              <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
              <p><strong>Amex:</strong> 3782 822463 10005</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p className="mt-2"><em>Use any future date for expiry and any 3-digit CVC</em></p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Try Checkout Page
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Integration Summary:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Backend:</strong> Django with Stripe API integration</li>
              <li>• <strong>Frontend:</strong> React with Stripe React components</li>
              <li>• <strong>Payment Methods:</strong> Credit/Debit cards via Stripe + Cash on Delivery</li>
              <li>• <strong>Security:</strong> Stripe handles all card data (PCI compliant)</li>
              <li>• <strong>Test Mode:</strong> All payments are in test mode (no real charges)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;

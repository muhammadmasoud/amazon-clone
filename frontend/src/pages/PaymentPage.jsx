import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StripeCheckout from '../components/payment/StripeCheckout';
import { paymentService } from '../services/paymentService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // You'll need to create an API endpoint to fetch order details
        // For now, we'll simulate the order data
        const mockOrder = {
          id: parseInt(orderId),
          order_number: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          total_amount: '99.99',
          user: {
            username: 'customer',
            email: 'customer@example.com'
          }
        };
        setOrder(mockOrder);
      } catch (error) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePaymentSuccess = (paymentIntent, paymentId) => {
    // Navigate to success page
    navigate(`/payment-success/${paymentId}`, {
      state: {
        paymentIntent,
        order,
        paymentId
      }
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // You can show an error message or redirect to an error page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Secure checkout powered by Stripe</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${order.total_amount}</span>
              </div>
            </div>
          </div>

          <StripeCheckout
            order={order}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <div className="text-center mt-8">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';

// Stripe styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
  disableLink: true,
};

// Payment form component
const PaymentForm = ({ order, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue with payment');
          return;
        }

        console.log('Creating payment intent for order:', order);

        // Use a simple cart identifier - the backend will handle creating the order
        const cartOrderId = 'cart-checkout';
        
        const response = await paymentService.createPaymentIntent(cartOrderId);
        console.log('Payment intent response:', response);
        
        setClientSecret(response.client_secret);
        setPaymentId(response.payment_id);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Payment initialization error:', error);
        if (error.response?.status === 401) {
          setError('Please log in to continue with payment');
        } else {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to initialize payment';
          setError(errorMessage);
        }
        onError && onError(error);
      }
    };

    if (order?.total_amount && order.total_amount > 0) {
      createPaymentIntent();
    } else {
      setError('Invalid order amount');
    }
  }, [order]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: order.user?.username || 'Customer',
            email: order.user?.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentService.confirmPayment(paymentIntent.id, paymentId);
        onSuccess && onSuccess(paymentIntent, paymentId);
      }
    } catch (error) {
      setError(error.message || 'Payment failed');
      onError && onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Order: {order.order_number}</p>
          <p className="text-lg font-bold text-gray-900">${order.total_amount}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement 
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Test Card: 4242 4242 4242 4242, any future date, any 3-digit CVC
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret || error || !cardComplete}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors duration-200 ${
          !stripe || loading || !clientSecret || error || !cardComplete
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : error ? (
          'Please fix errors above'
        ) : !cardComplete ? (
          'Please complete card information'
        ) : (
          `Pay $${order.total_amount}`
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-medium">Stripe</span>
        </p>
      </div>
    </form>
  );
};

// Main checkout component
const StripeCheckout = ({ order, onSuccess, onError }) => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const loadStripeKey = async () => {
      try {
        const config = await paymentService.getStripeConfig();
        setStripePromise(loadStripe(config.publishable_key));
      } catch (error) {
        console.error('Error loading Stripe:', error);
        // Fallback to hardcoded key
        setStripePromise(loadStripe('pk_test_51S0V4yKX6jTnh1HUq5GKWEbvQJCiDzmRdABguQc3DphlpwkSj395xoJZtBFLMdjN2jvQpvNqULJcpT64ex3A9ad700749gltol'));
      }
    };

    loadStripeKey();
  }, []);

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payment...</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        order={order}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckout;

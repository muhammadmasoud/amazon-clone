import { loadStripe } from '@stripe/stripe-js';

// This will be fetched from your backend
let stripePromise = null;

export const getStripe = async () => {
  if (!stripePromise) {
    try {
      // Fetch the publishable key from your backend
      const response = await fetch('http://localhost:8000/api/payments/stripe-config/');
      const { publishable_key } = await response.json();
      stripePromise = loadStripe(publishable_key);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      // Fallback to hardcoded key for development
      stripePromise = loadStripe('pk_test_51S0V4yKX6jTnh1HUq5GKWEbvQJCiDzmRdABguQc3DphlpwkSj395xoJZtBFLMdjN2jvQpvNqULJcpT64ex3A9ad700749gltol');
    }
  }
  return stripePromise;
};

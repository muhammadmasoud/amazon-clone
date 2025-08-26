import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { paymentService } from '../services/paymentService';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (location.state) {
          // Use data from navigation state if available
          setPaymentDetails({
            payment: location.state.paymentIntent,
            order: location.state.order,
            paymentId: location.state.paymentId
          });
        } else if (paymentId) {
          // Fetch payment details from API
          const response = await paymentService.getPaymentStatus(paymentId);
          setPaymentDetails(response);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
            </div>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{paymentDetails.paymentId || paymentId}</span>
                  </div>
                  {paymentDetails.order && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{paymentDetails.order.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">${paymentDetails.order.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600 capitalize">
                          {paymentDetails.order.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• Your order will be processed within 1-2 business days</li>
                  <li>• You can track your order status in your account</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If you have any questions about your order, please{' '}
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  contact us
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

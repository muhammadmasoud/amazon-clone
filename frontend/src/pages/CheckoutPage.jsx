import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext.jsx';
import StripeCheckout from '../components/payment/StripeCheckout';
import { placeOrder } from '../api/orders';
import { getPendingOrders } from '../api/orders';
import { 
  selectCartItems, 
  selectCartLoading, 
  selectCartError,
  selectCartSubtotal,
  selectCartShipping,
  selectCartTax,
  selectCartDiscount,
  selectCartTotal,
  selectPromoCode
} from '../redux/actions/reducers/cartReducer';
import { fetchCart } from '../redux/actions/cartActions';
import { clearCart } from '../redux/actions/cartActions';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  
  // Cart state from Redux
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const tax = useSelector(selectCartTax);
  const discount = useSelector(selectCartDiscount);
  const total = useSelector(selectCartTotal);
  const promoCode = useSelector(selectPromoCode);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSubmissionTimestamp, setOrderSubmissionTimestamp] = useState(null);
  
  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'USA',
    shipping_phone: '',
    customer_notes: ''
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load cart data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart');
    }
  }, [cartItems, loading, navigate]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    if (method === 'stripe') {
      setShowStripeCheckout(true);
    } else {
      setShowStripeCheckout(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!validateShippingForm()) return;

    // Check if cart has items
    if (!cartItems || cartItems.length === 0) {
      showNotification('Your cart is empty. Please add items to cart first.', 'error');
      navigate('/cart');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      showNotification('Please log in to place an order.', 'error');
      navigate('/login');
      return;
    }

    // Prevent multiple clicks and rapid submissions
    if (isPlacingOrder) {
      return;
    }
    
    // Additional check: prevent submissions within 3 seconds of each other
    const now = Date.now();
    if (orderSubmissionTimestamp && (now - orderSubmissionTimestamp) < 3000) {
      showNotification('Please wait before submitting another order.', 'warning');
      return;
    }
    
    setOrderSubmissionTimestamp(now);
    setIsPlacingOrder(true);
    
    try {
      // First check if user has any pending orders
      try {
        const pendingOrdersResponse = await getPendingOrders();
        const pendingOrders = pendingOrdersResponse.data.results || pendingOrdersResponse.data;
        
        if (pendingOrders && pendingOrders.length > 0) {
          const pendingOrder = pendingOrders[0];
          showNotification(
            `You already have a pending order (${pendingOrder.order_number}). Please complete or cancel it first.`, 
            'warning'
          );
          navigate(`/orders/${pendingOrder.id}`);
          return;
        }
      } catch (pendingOrderError) {
        console.log('Failed to check pending orders:', pendingOrderError);
        // Continue with order placement if pending check fails
      }

      const orderData = {
        cart: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: 'cash_on_delivery',
        ...shippingForm
      };

      const response = await placeOrder(orderData);
      
      // Check if this was a duplicate order response
      if (response.data?.is_duplicate) {
        showNotification('Order already exists with the same items.', 'info');
        const existingOrder = response.data.order;
        
        // Clear cart since order exists
        await dispatch(clearCart());
        navigate(`/orders/${existingOrder.id}`);
        return;
      }
      
      // Normal successful order creation
      showNotification('Cash on Delivery order placed successfully!', 'success');
      
      // Clear cart from Redux store
      await dispatch(clearCart());
      
      navigate(`/orders/${response.data.order.id}`);
    } catch (error) {
      console.log('Cash on delivery error response:', error.response);
      console.log('Cash on delivery error data:', error.response?.data);
      
      // Enhanced error handling for duplicate orders
      if (error.response?.status === 409 && error.response?.data?.existing_order_id) {
        // Conflict status for duplicate orders
        const existingOrderId = error.response.data.existing_order_id;
        const existingOrderNumber = error.response.data.existing_order_number;
        
        showNotification(
          `You already have a pending order (${existingOrderNumber}). Please complete or cancel it first.`, 
          'warning'
        );
        
        // Navigate to the existing order immediately
        navigate(`/orders/${existingOrderId}`);
        return; // Don't continue with order placement
        
      } else if (error.response?.status === 400 && error.response?.data?.existing_order_id) {
        const existingOrderId = error.response.data.existing_order_id;
        const existingOrderNumber = error.response.data.existing_order_number;
        
        showNotification(
          `You already have a pending order (${existingOrderNumber}). Please complete or cancel it first.`, 
          'warning'
        );
        
        // Navigate to the existing order immediately
        navigate(`/orders/${existingOrderId}`);
        return; // Don't continue with order placement
        
      } else if ((error.response?.status === 200 || error.response?.status === 201) && error.response?.data?.is_duplicate) {
        // User already has the same order - this is a success case but duplicate
        showNotification('Order already exists with the same items.', 'info');
        const existingOrder = error.response.data.order;
        
        // Clear cart since order exists
        await dispatch(clearCart());
        navigate(`/orders/${existingOrder.id}`);
        return; // Don't continue with order placement
        
      } else {
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            'Failed to place order. Please try again.';
        showNotification(errorMessage, 'error');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent, paymentId) => {
    // Clear cart from Redux store after successful payment
    await dispatch(clearCart());
    
    navigate(`/payment-success/${paymentId}`, {
      state: {
        paymentIntent,
        order: {
          id: Date.now(),
          order_number: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          total_amount: total,
          items: cartItems
        },
        paymentId
      }
    });
  };

  const handleStripeError = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  const validateShippingForm = () => {
    if (!shippingForm.shipping_address.trim()) {
      alert('Please enter a shipping address');
      return false;
    }
    return true;
  };

  const handleShippingFormChange = (field, value) => {
    setShippingForm(prev => ({ ...prev, [field]: value }));
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
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img 
                      src={item.product.image || '/placeholder-product.svg'} 
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${parseFloat(subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{parseFloat(shipping || 0) === 0 ? 'FREE' : `$${parseFloat(shipping).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${parseFloat(tax || 0).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {promoCode && `(${promoCode})`}:</span>
                    <span>-${parseFloat(discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${parseFloat(total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address *
                    </label>
                    <textarea
                      value={shippingForm.shipping_address}
                      onChange={(e) => handleShippingFormChange('shipping_address', e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Enter your full shipping address..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={shippingForm.shipping_city}
                        onChange={(e) => handleShippingFormChange('shipping_city', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={shippingForm.shipping_state}
                        onChange={(e) => handleShippingFormChange('shipping_state', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={shippingForm.shipping_zip}
                        onChange={(e) => handleShippingFormChange('shipping_zip', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={shippingForm.shipping_phone}
                        onChange={(e) => handleShippingFormChange('shipping_phone', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={shippingForm.customer_notes}
                      onChange={(e) => handleShippingFormChange('customer_notes', e.target.value)}
                      rows="2"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Stripe Payment */}
                  <div className="border rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment_method"
                        value="stripe"
                        checked={selectedPaymentMethod === 'stripe'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Credit/Debit Card</div>
                        <div className="text-sm text-gray-500">Secure payment with Stripe</div>
                      </div>
                      <div className="flex space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">VISA</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">MC</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AMEX</span>
                      </div>
                    </label>
                  </div>

                  {/* Cash on Delivery */}
                  <div className="border rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={selectedPaymentMethod === 'cash_on_delivery'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when you receive your order</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Section */}
                {selectedPaymentMethod === 'stripe' && (
                  <div className="mt-6">
                    <StripeCheckout
                      order={{
                        id: Date.now(),
                        order_number: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                        total_amount: total,
                        items: cartItems,
                        shipping_info: shippingForm
                      }}
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                    />
                  </div>
                )}

                {selectedPaymentMethod === 'cash_on_delivery' && (
                  <div className="mt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        You will pay ${parseFloat(total || 0).toFixed(2)} when your order is delivered to your doorstep.
                      </p>
                    </div>
                    <button
                      onClick={handleCashOnDelivery}
                      disabled={isPlacingOrder || !shippingForm.shipping_address.trim()}
                      className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                        isPlacingOrder || !shippingForm.shipping_address.trim()
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isPlacingOrder ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                          Placing Order...
                        </div>
                      ) : (
                        'Place Order (Cash on Delivery)'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/cart')}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

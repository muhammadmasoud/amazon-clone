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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden flex items-center justify-center">
        <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Checkout
          </h3>
          <p className="text-gray-600">Preparing your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/30 relative overflow-hidden flex items-center justify-center">
        <div className="glass-card rounded-3xl shadow-2xl border border-red-200/50 p-12 text-center bg-gradient-to-r from-red-50/80 to-pink-50/80">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="btn-primary relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/8 to-pink-400/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg group hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                      Checkout
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg font-medium">
                      <span className="flex items-center text-green-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure checkout process
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Order progress indicator */}
                <div className="hidden md:block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl px-6 py-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600 mb-1">Final Step</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${parseFloat(total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Order Summary */}
            <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 bg-gradient-to-br from-white/60 to-gray-50/60 relative overflow-hidden hover:shadow-3xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/8 to-emerald-400/8 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9m4 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                </div>
                
                <div className="space-y-4 mb-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white/80 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md ring-2 ring-white/50">
                        <img 
                          src={item.product.image || '/placeholder-product.svg'} 
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-5">{item.product.title}</h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200/50 pt-6 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Subtotal:</span>
                    <span className="text-lg font-bold text-gray-900">${parseFloat(subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Shipping:</span>
                    <span className="text-lg font-bold">
                      {parseFloat(shipping || 0) === 0 ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        <span className="text-gray-900">${parseFloat(shipping).toFixed(2)}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Tax:</span>
                    <span className="text-lg font-bold text-gray-900">${parseFloat(tax || 0).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-green-700 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Discount {promoCode && `(${promoCode})`}:
                      </span>
                      <span className="text-lg font-bold text-green-600">-${parseFloat(discount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${parseFloat(total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="space-y-6">
              {/* Enhanced Shipping Information */}
              <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 bg-gradient-to-br from-white/60 to-blue-50/60 relative overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Shipping Information
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0h2M3 21h2m0 0h2" />
                        </svg>
                        Shipping Address *
                      </label>
                      <textarea
                        value={shippingForm.shipping_address}
                        onChange={(e) => handleShippingFormChange('shipping_address', e.target.value)}
                        rows="3"
                        className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0 resize-none"
                        placeholder="Enter your full shipping address..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0h2M3 21h2m0 0h2" />
                          </svg>
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingForm.shipping_city}
                          onChange={(e) => handleShippingFormChange('shipping_city', e.target.value)}
                          className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0"
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          State
                        </label>
                        <input
                          type="text"
                          value={shippingForm.shipping_state}
                          onChange={(e) => handleShippingFormChange('shipping_state', e.target.value)}
                          className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0"
                          placeholder="Enter state"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={shippingForm.shipping_zip}
                          onChange={(e) => handleShippingFormChange('shipping_zip', e.target.value)}
                          className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0"
                          placeholder="Enter ZIP code"
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={shippingForm.shipping_phone}
                          onChange={(e) => handleShippingFormChange('shipping_phone', e.target.value)}
                          className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={shippingForm.customer_notes}
                        onChange={(e) => handleShippingFormChange('customer_notes', e.target.value)}
                        rows="2"
                        className="input-field rounded-2xl border-2 focus:border-blue-500 focus:ring-0 resize-none"
                        placeholder="Any special delivery instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Payment Methods */}
              <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 bg-gradient-to-br from-white/60 to-green-50/60 relative overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {/* Enhanced Stripe Payment */}
                    <div className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      selectedPaymentMethod === 'stripe' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                        : 'border-gray-200 bg-white/80 hover:border-blue-300'
                    }`}>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="payment_method"
                            value="stripe"
                            checked={selectedPaymentMethod === 'stripe'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          {selectedPaymentMethod === 'stripe' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-gray-900 text-lg flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Credit/Debit Card
                              </div>
                              <div className="text-sm text-gray-600 font-medium">Secure payment with Stripe</div>
                            </div>
                            <div className="flex space-x-2">
                              <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-xl font-bold border border-blue-300">VISA</span>
                              <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-xl font-bold border border-blue-300">MC</span>
                              <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-xl font-bold border border-blue-300">AMEX</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Enhanced Cash on Delivery */}
                    <div className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      selectedPaymentMethod === 'cash_on_delivery' 
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg' 
                        : 'border-gray-200 bg-white/80 hover:border-green-300'
                    }`}>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="payment_method"
                            value="cash_on_delivery"
                            checked={selectedPaymentMethod === 'cash_on_delivery'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="w-5 h-5 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          {selectedPaymentMethod === 'cash_on_delivery' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 ml-4">
                          <div className="font-bold text-gray-900 text-lg flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                            </svg>
                            Cash on Delivery
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Pay when you receive your order</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Section */}
                  {selectedPaymentMethod === 'stripe' && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl">
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
                    <div className="mt-6 space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl p-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl mr-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-yellow-800 text-lg">
                              💰 Payment: ${parseFloat(total || 0).toFixed(2)} on delivery
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your order will be delivered to your doorstep. Payment is collected upon delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleCashOnDelivery}
                        disabled={isPlacingOrder || !shippingForm.shipping_address.trim()}
                        className={`group w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
                                 transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                          isPlacingOrder || !shippingForm.shipping_address.trim()
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed text-gray-500'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {isPlacingOrder ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mr-3"></div>
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Place Order (Cash on Delivery)
                            </>
                          )}
                        </span>
                        {!isPlacingOrder && shippingForm.shipping_address.trim() && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                        -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Back to Cart */}
          <div className="text-center mt-12">
            <div className="glass-card rounded-2xl shadow-xl border border-white/30 p-6 bg-gradient-to-r from-white/60 to-gray-50/60 inline-block">
              <button
                onClick={() => navigate('/cart')}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 
                         hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold rounded-xl 
                         shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 
                         relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Cart
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  updateCartQuantity, 
  removeFromCart, 
  clearCart,
  applyPromoCode,
  removePromoCode,
  fetchCart
} from "../redux/actions/cartActions";
import { placeOrder } from "../api/orders";
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
} from "../redux/actions/reducers/cartReducer";

export default function Cartpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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

  // Local state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'USA',
    shipping_phone: '',
    payment_method: 'cash_on_delivery',
    customer_notes: ''
  });

  // Load cart data on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle quantity updates with optimistic UI
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await dispatch(updateCartQuantity(item.id, newQuantity));
      showNotification(`Updated ${item.product.title} quantity to ${newQuantity}`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await dispatch(removeFromCart(item.id));
      showNotification(`Removed ${item.product.title} from cart`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart());
        showNotification('Cart cleared successfully', 'success');
      } catch (error) {
        showNotification('Failed to clear cart', 'error');
      }
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    try {
      setApplyingPromo(true);
      const result = await dispatch(applyPromoCode(promoCodeInput.trim()));
      showNotification(result.message || 'Promo code applied successfully!', 'success');
      setPromoCodeInput('');
    } catch (error) {
      showNotification(error.message || 'Failed to apply promo code', 'error');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = async () => {
    try {
      await dispatch(removePromoCode());
      showNotification('Promo code removed', 'success');
    } catch (error) {
      showNotification('Failed to remove promo code', 'error');
    }
  };

  const handleCheckout = async () => {
    if (!validateCheckoutForm()) return;

    setIsPlacingOrder(true);
    try {
      const orderData = {
        cart: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        ...checkoutForm
      };

      const response = await placeOrder(orderData);
      showNotification('Order placed successfully!', 'success');
      
      // Clear cart from Redux store
      await dispatch(clearCart());
      
      // Redirect to order details or order history
      navigate(`/orders/${response.data.order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to place order. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const validateCheckoutForm = () => {
    if (!checkoutForm.shipping_address.trim()) {
      showNotification('Please enter a shipping address', 'error');
      return false;
    }
    return true;
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const isCartEmpty = !cartItems || cartItems.length === 0;
  const hasUnavailableItems = cartItems.some(item => !item.is_available);

  if (loading && isCartEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/8 to-pink-400/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-400/5 to-red-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`px-6 py-4 rounded-2xl shadow-2xl text-white backdrop-blur-md border border-white/20 transform transition-all duration-500 ${
                notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                'bg-gradient-to-r from-blue-500 to-indigo-500'
              } animate-slide-in-right`}
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full bg-white/20 mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {notification.type === 'success' ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : notification.type === 'error' ? (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            {/* Header background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg group hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg font-medium">
                    {isCartEmpty ? 
                      <span className="flex items-center text-orange-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Your cart is empty
                      </span> : 
                      <span className="flex items-center text-blue-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ready for checkout
                      </span>
                    }
                  </p>
                </div>
              </div>
              
              {/* Cart value display */}
              {!isCartEmpty && (
                <div className="hidden md:block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl px-6 py-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600 mb-1">Cart Total</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${parseFloat(total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 glass-card rounded-2xl border border-red-200/50 p-6 bg-gradient-to-r from-red-50/80 to-pink-50/80">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-xl mr-4">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-lg">Something went wrong</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isCartEmpty ? (
          <EmptyCartState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Unavailable Items Warning */}
              {hasUnavailableItems && (
                <div className="glass-card rounded-2xl border border-yellow-200/50 p-6 bg-gradient-to-r from-yellow-50/80 to-orange-50/80">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl mr-4">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-800 text-lg">Attention Required</h3>
                      <p className="text-yellow-700">Some items in your cart are no longer available or have insufficient stock.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Cart Actions */}
              <div className="glass-card rounded-2xl shadow-xl border border-white/30 p-6 bg-gradient-to-r from-white/60 to-gray-50/60">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        Total: {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                      <p className="text-sm text-gray-600">Ready for checkout</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearCart}
                    className="group flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 
                             hover:from-red-100 hover:to-pink-100 text-red-600 font-medium rounded-xl 
                             border border-red-200/50 hover:border-red-300 transition-all duration-200 
                             hover:scale-105 hover:shadow-lg"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    loading={loading}
                  />
                ))}
              </div>

              {/* Enhanced Continue Shopping */}
              <div className="glass-card rounded-2xl shadow-xl border border-white/30 p-6 bg-gradient-to-r from-white/60 to-gray-50/60">
                <Link
                  to="/"
                  className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 
                           hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold rounded-xl 
                           shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 
                           relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Continue Shopping
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                discount={discount}
                total={total}
                promoCode={promoCode}
                promoCodeInput={promoCodeInput}
                setPromoCodeInput={setPromoCodeInput}
                onApplyPromoCode={handleApplyPromoCode}
                onRemovePromoCode={handleRemovePromoCode}
                applyingPromo={applyingPromo}
                disabled={isCartEmpty || hasUnavailableItems}
              />

              {!showCheckout ? (
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={isCartEmpty || hasUnavailableItems || loading}
                  className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                           text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
                           disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed 
                           transition-all duration-300 hover:scale-105 disabled:hover:scale-100 
                           relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Proceed to Checkout
                  </span>
                  {!isCartEmpty && !hasUnavailableItems && !loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty Cart Component
function EmptyCartState() {
  return (
    <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-16 text-center bg-gradient-to-br from-white/60 to-gray-50/60 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-pink-400/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Your cart is empty
        </h3>
        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
          Discover amazing products and start your shopping journey with us. Your perfect items are just a click away!
        </p>
        <Link
          to="/"
          className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
                   text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl 
                   transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center">
            <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Start Shopping
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
        </Link>
      </div>
    </div>
  );
}

// Cart Item Card Component
function CartItemCard({ item, onQuantityChange, onRemove, loading }) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    setLocalQuantity(newQuantity);
    onQuantityChange(item, newQuantity);
  };

  const isUnavailable = !item.is_available;
  const hasPriceChange = item.price_difference && item.price_difference !== 0;

  return (
    <div className={`glass-card rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl 
                    transition-all duration-500 relative overflow-hidden group
                    ${isUnavailable ? 'opacity-75' : 'hover:-translate-y-1'}`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-xl 
                    group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all duration-500"></div>
      
      <div className="relative z-10 flex items-start space-x-6">
        {/* Enhanced Product Image */}
        <div className="flex-shrink-0 relative">
          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/50 group-hover:ring-blue-200/50 transition-all duration-300">
            <img
              src={item.product.image || '/placeholder-product.svg'}
              alt={item.product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
            />
          </div>
          
          {/* Availability indicator */}
          {isUnavailable && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 
                          text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-grow pr-4">
              <Link
                to={`/product/${item.product.id}`}
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 
                         line-clamp-2 leading-6 group-hover:text-blue-700"
              >
                {item.product.title}
              </Link>
              
              {item.product.category && (
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium 
                                 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {item.product.category.name}
                  </span>
                </div>
              )}

              {/* Price Information */}
              <div className="mt-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${parseFloat(item.current_price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">each</span>
                </div>
                
                {hasPriceChange && (
                  <div className="text-sm mt-1">
                    {item.price_difference > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        +${parseFloat(item.price_difference).toFixed(2)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        -${Math.abs(parseFloat(item.price_difference)).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {isUnavailable && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold 
                                 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Insufficient Stock
                  </span>
                </div>
              )}
            </div>

            {/* Price and Remove Button */}
            <div className="flex flex-col items-end space-y-3">
              <div className="text-right">
                <div className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 font-medium">total</div>
              </div>
              
              <button
                onClick={() => onRemove(item)}
                className="group p-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 
                         rounded-xl border border-red-200/50 hover:border-red-300 transition-all duration-200 
                         hover:scale-110 hover:shadow-lg"
                disabled={loading}
              >
                <svg className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform duration-200" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center bg-white/80 border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || localQuantity <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={localQuantity}
                  onChange={(e) => {
                    const newValue = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.product.stock));
                    handleQuantityChange(newValue);
                  }}
                  className="w-16 text-center border-0 py-2 bg-transparent focus:ring-0 focus:outline-none font-medium"
                  disabled={loading}
                />
                <button
                  onClick={() => handleQuantityChange(Math.min(item.product.stock, localQuantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || localQuantity >= item.product.stock}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 font-medium">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item.product.stock} available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({ 
  subtotal, shipping, tax, discount, total, promoCode, 
  promoCodeInput, setPromoCodeInput, onApplyPromoCode, 
  onRemovePromoCode, applyingPromo, disabled 
}) {
  return (
    <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-8 bg-gradient-to-br from-white/60 to-gray-50/60 
                  relative overflow-hidden hover:shadow-3xl transition-all duration-500">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/8 to-emerald-400/8 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/8 to-purple-400/8 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2V7m0 0V4a2 2 0 012-2h6a2 2 0 012 2v3M8 21l4-4 4 4M8 21l-4-4 4-4M16 21l4-4-4-4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Order Summary
          </h3>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
            <span className="text-gray-700 font-medium">Subtotal</span>
            <span className="text-lg font-bold text-gray-900">${parseFloat(subtotal || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
            <span className="text-gray-700 font-medium">Shipping</span>
            <span className="text-lg font-bold">
              {parseFloat(shipping || 0) === 0 ? (
                <span className="text-green-600 font-bold">FREE</span>
              ) : (
                <span className="text-gray-900">${parseFloat(shipping).toFixed(2)}</span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
            <span className="text-gray-700 font-medium">Tax</span>
            <span className="text-lg font-bold text-gray-900">${parseFloat(tax || 0).toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-green-200/50">
              <span className="text-green-700 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Discount {promoCode && `(${promoCode})`}
              </span>
              <span className="text-lg font-bold text-green-600">-${parseFloat(discount).toFixed(2)}</span>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${parseFloat(total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Promo Code Section */}
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900">Promo Code</h4>
          </div>
          
          {promoCode ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-4 py-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-green-800">{promoCode} applied</span>
              </div>
              <button
                onClick={onRemovePromoCode}
                className="text-green-600 hover:text-green-800 font-medium text-sm bg-white/50 px-3 py-1 rounded-xl 
                         hover:bg-white/80 transition-all duration-200"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium 
                           focus:border-blue-500 focus:ring-0 focus:outline-none bg-white/80 backdrop-blur-sm
                           placeholder-gray-400"
                  disabled={disabled || applyingPromo}
                />
                <button
                  onClick={onApplyPromoCode}
                  disabled={!promoCodeInput.trim() || disabled || applyingPromo}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl 
                           font-bold text-sm hover:from-orange-600 hover:to-red-600 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                           hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {applyingPromo ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </div>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Free Shipping Notice */}
        {parseFloat(subtotal || 0) < 100 && parseFloat(subtotal || 0) > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">
                  💡 Add ${(100 - parseFloat(subtotal)).toFixed(2)} more for free shipping!
                </p>
                <p className="text-xs text-blue-600 mt-1">Free shipping on orders over $100</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Checkout Form Component
function CheckoutForm({ form, setForm, onSubmit, onBack, isPlacingOrder }) {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Checkout Information</h3>
      
      <div className="space-y-4">
        {/* Shipping Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipping Address *
          </label>
          <textarea
            value={form.shipping_address}
            onChange={(e) => handleChange('shipping_address', e.target.value)}
            rows="3"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Enter your full shipping address..."
            required
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={form.shipping_city}
              onChange={(e) => handleChange('shipping_city', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={form.shipping_state}
              onChange={(e) => handleChange('shipping_state', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={form.shipping_zip}
              onChange={(e) => handleChange('shipping_zip', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.shipping_phone}
              onChange={(e) => handleChange('shipping_phone', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={form.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Customer Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            value={form.customer_notes}
            onChange={(e) => handleChange('customer_notes', e.target.value)}
            rows="2"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Any special delivery instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onBack}
            disabled={isPlacingOrder}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isPlacingOrder || !form.shipping_address.trim()}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isPlacingOrder ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Placing Order...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

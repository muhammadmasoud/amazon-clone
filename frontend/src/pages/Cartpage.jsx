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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">
            {isCartEmpty ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isCartEmpty ? (
          <EmptyCartState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Unavailable Items Warning */}
              {hasUnavailableItems && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  ⚠️ Some items in your cart are no longer available or have insufficient stock.
                </div>
              )}

              {/* Cart Actions */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <span className="text-sm text-gray-600">
                  Total: {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  disabled={loading}
                >
                  Clear Cart
                </button>
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

              {/* Continue Shopping */}
              <div className="bg-white p-6 rounded-lg shadow">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
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
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Proceed to Checkout
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
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5m6 0v.01M15 13v.01" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-600 mb-8">Start shopping to add items to your cart.</p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Start Shopping
      </Link>
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
    <div className={`bg-white rounded-lg shadow p-6 ${isUnavailable ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product.image || '/placeholder-product.svg'}
            alt={item.product.title}
            className="w-24 h-24 object-cover rounded-lg border"
            onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <Link
                to={`/product/${item.product.id}`}
                className="text-lg font-medium text-gray-900 hover:text-blue-600"
              >
                {item.product.title}
              </Link>
              
              {item.product.category && (
                <p className="text-sm text-gray-500 mt-1">
                  Category: {item.product.category.name}
                </p>
              )}

              {/* Price Information */}
              <div className="mt-2">
                <span className="text-lg font-semibold text-gray-900">
                  ${parseFloat(item.current_price).toFixed(2)}
                </span>
                
                {hasPriceChange && (
                  <div className="text-sm mt-1">
                    {item.price_difference > 0 ? (
                      <span className="text-red-600">
                        Price increased by ${parseFloat(item.price_difference).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        Price decreased by ${Math.abs(parseFloat(item.price_difference)).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Availability Status */}
              {isUnavailable && (
                <div className="mt-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    Insufficient Stock
                  </span>
                </div>
              )}
            </div>

            {/* Price and Remove Button */}
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-gray-900">
                ${parseFloat(item.subtotal).toFixed(2)}
              </div>
              <button
                onClick={() => onRemove(item)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                disabled={loading || localQuantity <= 1}
              >
                −
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
                className="w-16 text-center border-0 py-1 focus:ring-0"
                disabled={loading}
              />
              <button
                onClick={() => handleQuantityChange(Math.min(item.product.stock, localQuantity + 1))}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                disabled={loading || localQuantity >= item.product.stock}
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              ({item.product.stock} available)
            </span>
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${parseFloat(subtotal || 0).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>
            {parseFloat(shipping || 0) === 0 ? 'FREE' : `$${parseFloat(shipping).toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${parseFloat(tax || 0).toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount {promoCode && `(${promoCode})`}</span>
            <span>-${parseFloat(discount).toFixed(2)}</span>
          </div>
        )}
        
        <hr className="my-3" />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${parseFloat(total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">Promo Code</h4>
        
        {promoCode ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
            <span className="text-sm text-green-800">{promoCode} applied</span>
            <button
              onClick={onRemovePromoCode}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={disabled || applyingPromo}
            />
            <button
              onClick={onApplyPromoCode}
              disabled={!promoCodeInput.trim() || disabled || applyingPromo}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              {applyingPromo ? 'Applying...' : 'Apply'}
            </button>
          </div>
        )}
      </div>

      {/* Free Shipping Notice */}
      {parseFloat(subtotal || 0) < 100 && parseFloat(subtotal || 0) > 0 && (
        <div className="mt-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          💡 Add ${(100 - parseFloat(subtotal)).toFixed(2)} more for free shipping!
        </div>
      )}
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

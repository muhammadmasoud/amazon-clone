import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addToCartWithNotification } from '../redux/actions/cartActions';

function ProductActionButtons({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleAddToCart = async () => {
    if (!user) {
      showNotification('Please sign in to add items to cart', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (product.stock === 0) {
      showNotification('This item is out of stock', 'error');
      return;
    }

    if (quantity > product.stock) {
      showNotification(`Only ${product.stock} items available in stock`, 'error');
      return;
    }

    try {
      setIsAddingToCart(true);
      const result = await dispatch(addToCartWithNotification(product, quantity));
      
      if (result.success) {
        showNotification(`${quantity} x ${product.title} added to cart!`, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to add item to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      showNotification('Please sign in to continue', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (product.stock === 0) {
      showNotification('This item is out of stock', 'error');
      return;
    }

    if (quantity > product.stock) {
      showNotification(`Only ${product.stock} items available in stock`, 'error');
      return;
    }

    try {
      setIsAddingToCart(true);
      const result = await dispatch(addToCartWithNotification(product, quantity));
      
      if (result.success) {
        showNotification('Redirecting to checkout...', 'success');
        setTimeout(() => navigate('/checkout'), 1000);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to proceed with purchase', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-300 transform animate-slide-in-right backdrop-blur-sm border ${
              notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400/50' :
              notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-400/50' : 
              'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : notification.type === 'error' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="quantity" className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
                Quantity
              </label>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full text-sm font-medium text-green-800">
                {product.stock} in stock
              </div>
            </div>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm text-lg"
              disabled={isAddingToCart}
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'item' : 'items'}
                </option>
              ))}
            </select>
            {product.stock > 10 && (
              <p className="text-sm text-gray-500 mt-2 bg-white/60 px-3 py-1 rounded-full inline-block">
                Maximum 10 per order
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg relative overflow-hidden group shadow-lg ${
              product.stock === 0 || isAddingToCart
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 text-gray-900 hover:shadow-xl transform hover:scale-105 active:scale-95'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {isAddingToCart ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Adding to Cart...</span>
                </>
              ) : product.stock === 0 ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </span>
            {product.stock > 0 && !isAddingToCart && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            )}
          </button>

          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0 || isAddingToCart}
            className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg relative overflow-hidden group shadow-lg ${
              product.stock === 0 || isAddingToCart
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white hover:shadow-xl transform hover:scale-105 active:scale-95'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {isAddingToCart ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Buy Now</span>
                </>
              )}
            </span>
            {product.stock > 0 && !isAddingToCart && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            )}
          </button>
        </div>

        {/* Additional Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">30-day return policy</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-sm font-medium text-green-800">Free shipping available</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductActionButtons;
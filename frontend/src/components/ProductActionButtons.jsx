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
            className={`px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAddingToCart}
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            {product.stock > 10 && (
              <span className="text-xs text-gray-500">Max 10 per order</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className={`flex-1 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              product.stock === 0 || isAddingToCart
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
                : 'bg-[#febd69] hover:bg-[#f3a847] text-gray-900 focus:ring-yellow-500'
            }`}
          >
            {isAddingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0 || isAddingToCart}
            className={`flex-1 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              product.stock === 0 || isAddingToCart
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
                : 'bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 border-[#ff8f00] focus:ring-yellow-500'
            }`}
          >
            {isAddingToCart ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </>
  );
}

export default ProductActionButtons;
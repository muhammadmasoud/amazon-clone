import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/actions/cartActions';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevents the Link navigation
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }

    if (product.stock === 0) {
      return;
    }

    try {
      setIsAdding(true);
      await dispatch(addToCart(product.id, 1));
      // Show success feedback with a temporary message
      const button = e.target;
      const originalText = button.textContent;
      button.textContent = '✓ Added!';
      button.style.backgroundColor = '#10B981';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message briefly
      const button = e.target;
      const originalText = button.textContent;
      button.textContent = 'Error - Try Again';
      button.style.backgroundColor = '#EF4444';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <Link to={`/product/${product.id}`} className='block'>
    <div className="bg-white border border-gray-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      
      {/* Image Section - More spacious */}
      <div className="w-full h-52 bg-gray-50 flex-shrink-0 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section - More breathing room */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        
        {/* Title - Better line height and spacing */}
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 leading-5 min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Rating Section - More Amazon-like */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`text-sm ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">
            ({product.average_rating || 0})
          </span>
        </div>

        {/* Price Section - More prominent */}
        <div className="flex items-baseline space-x-1">
          <span className="text-sm text-gray-600">EGP</span>
          <span className="text-xl font-bold text-gray-900">{product.unit_price}</span>
        </div>
        
        {/* Stock Status */}
        {product.stock === 0 ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-r">
            <p className="text-xs text-red-700 font-bold">
              Out of Stock
            </p>
          </div>
        ) : product.stock <= 10 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-r">
            <p className="text-xs text-red-700 font-medium">
              Only {product.stock} left in stock
            </p>
          </div>
        )}

        {/* Add to Cart Button - Conditional styling */}
        <div className="mt-auto pt-3">
          <button
            onClick={handleAddToCart} 
            disabled={product.stock === 0 || isAdding}
            className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              product.stock === 0 
                ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
                : isAdding
                ? 'bg-gray-400 text-gray-600 border-gray-500 cursor-not-allowed'
                : 'bg-[#febd69] hover:bg-[#f3a847] text-gray-900 focus:ring-yellow-500'
            }`}
          >
            {product.stock === 0 
              ? 'Out of Stock' 
              : isAdding 
              ? 'Adding...' 
              : 'Add to Cart'
            }
          </button>
        </div>
      </div>
    </div>
    </Link>
  );
  
}

export default ProductCard;
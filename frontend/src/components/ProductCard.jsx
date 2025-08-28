import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/actions/cartActions';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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
      setShowSuccess(false);
      setShowError(false);
      
      await dispatch(addToCart(product.id, 1));
      
      // Show success feedback
      setIsAdding(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      
      // Show error feedback
      setIsAdding(false);
      setShowError(true);
      
      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  };
  return (
    <Link to={`/product/${product.id}`} className='block group'>
      <div className="glass-card rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col cursor-pointer hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative">
        
        {/* Stock badge */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Only {product.stock} left!
            </span>
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Image Section */}
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden rounded-t-3xl relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">No Image</span>
              </div>
            </div>
          )}
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content Section */}
        <div className="p-8 flex flex-col flex-grow space-y-4 bg-white/60 backdrop-blur-sm">
          
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-6 min-h-[3rem] group-hover:text-blue-700 transition-colors duration-300">
            {product.title}
          </h3>

          {/* Rating Section */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-lg ${i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'} group-hover:scale-110 transition-transform duration-200`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-base text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer">
              ({(product.average_rating || 0).toFixed(1)})
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline space-x-1">
            <span className="text-base text-gray-600 font-medium">$</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {product.unit_price}
            </span>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-auto pt-2">
            <button
              onClick={handleAddToCart} 
              disabled={product.stock === 0 || isAdding || showSuccess}
              className={`w-full font-semibold py-3 px-4 rounded-2xl transition-all duration-300 text-sm border-2 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 active:scale-95 relative overflow-hidden group ${
                product.stock === 0 
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 border-gray-400 cursor-not-allowed shadow-lg' 
                  : showSuccess
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 cursor-not-allowed shadow-lg'
                  : showError
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 cursor-not-allowed shadow-lg'
                  : isAdding
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-700 border-gray-500 cursor-not-allowed shadow-lg'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-orange-400 focus:ring-orange-300 shadow-xl hover:shadow-2xl'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {product.stock === 0 
                  ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Out of Stock
                    </>
                  )
                  : showSuccess
                  ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added to Cart!
                    </>
                  )
                  : showError
                  ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Error - Try Again
                    </>
                  )
                  : isAdding 
                  ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Adding...
                    </>
                  )
                  : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Add to Cart
                    </>
                  )
                }
              </span>
              
              {/* Shine effect */}
              {!product.stock === 0 && !isAdding && !showSuccess && !showError && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
  
}

export default ProductCard;
import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = ({ title = "Featured Products", categoryId = null, limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getProducts(1, categoryId, null, null, null, 4, null); // Get high-rated products
        setProducts(response.data.results.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [categoryId, limit]);

  const handleViewAll = () => {
    // Prevent double clicks
    if (handleViewAll.isNavigating) {
      console.log('Navigation already in progress, ignoring click');
      return;
    }
    handleViewAll.isNavigating = true;
    
    console.log('HandleViewAll called with categoryId:', categoryId);
    
    if (categoryId) {
      console.log('Navigating to category view:', `/?category=${categoryId}&view=products`);
      navigate(`/?category=${categoryId}&view=products`);
    } else {
      console.log('Navigating to all products view:', '/?view=products');
      // Show all products when no specific category
      navigate('/?view=products');
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      handleViewAll.isNavigating = false;
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 w-2 h-8 rounded-full mr-4 animate-pulse"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-64 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl w-32 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-6"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 w-2 h-8 rounded-full mr-4"></div>
            <h2 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {title}
            </h2>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('View all button clicked! CategoryId:', categoryId);
              handleViewAll();
            }}
            className="group bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold px-6 py-3 rounded-2xl 
                     hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-xl
                     border border-indigo-200 hover:border-indigo-300 relative overflow-hidden
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
          >
            <span className="relative z-10 group-hover:mr-2 transition-all duration-200">View all</span>
            <span className="relative z-10 inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
            {/* Simplified shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl 
                            transition-all duration-500 border border-white/50 hover:border-white/80 
                            relative overflow-hidden">
                {/* Enhanced ProductCard styling */}
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden mb-6 
                              group-hover:scale-110 transition-transform duration-500 relative">
                  <img
                    src={product.image || '/placeholder-product.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-transparent 
                             group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 
                             group-hover:bg-clip-text cursor-pointer transition-all duration-300"
                    onClick={() => navigate(`/product/${product.id}`)}>
                  {product.title}
                </h3>
                
                {product.unit_price && (
                  <div className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${product.unit_price}
                  </div>
                )}
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;

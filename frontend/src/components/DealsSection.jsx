import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const DealsSection = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        // Fetch products and simulate deals (in a real app, you'd have a deals API)
        const response = await getProducts(1, null, null, null, 100, null, null); // Products under $100
        const dealsData = response.data.results.slice(0, 6).map(product => ({
          ...product,
          originalPrice: (parseFloat(product.unit_price) * 1.2).toFixed(2), // Simulate original price
          discountPercent: Math.floor(Math.random() * 30) + 10 // Random discount 10-40%
        }));
        setDeals(dealsData);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleViewAllDeals = () => {
    navigate('/?max_price=100');
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 p-8 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md w-2 h-10 rounded-full mr-4 animate-pulse"></div>
              <div className="h-10 bg-white/20 backdrop-blur-md rounded-2xl w-64 animate-pulse"></div>
            </div>
            <div className="h-12 bg-white/20 backdrop-blur-md rounded-2xl w-32 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 p-8 rounded-2xl shadow-2xl overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-md w-2 h-10 rounded-full mr-4"></div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                🔥 Today's Deals
              </h2>
              <span className="bg-white text-red-600 text-sm font-black px-4 py-2 rounded-full 
                           shadow-lg animate-bounce transform hover:scale-110 transition-transform duration-300">
                LIMITED TIME
              </span>
            </div>
          </div>
          <button
            onClick={handleViewAllDeals}
            className="group bg-white/20 backdrop-blur-md text-white font-bold px-6 py-3 rounded-2xl 
                     hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl
                     border border-white/30 hover:border-white/50"
          >
            <span className="group-hover:mr-2 transition-all duration-300">View all deals</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="group bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl 
                                       hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105
                                       border border-white/50 hover:border-white/80 active:scale-95">
              <div className="relative overflow-hidden rounded-xl mb-4">
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-black px-3 py-1.5 
                              rounded-full z-10 shadow-lg animate-pulse">
                  -{deal.discountPercent}%
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <img
                    src={deal.image || '/placeholder-product.svg'}
                    alt={deal.title}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500"
                    onClick={() => navigate(`/product/${deal.id}`)}
                  />
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl"></div>
              </div>
              
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 hover:text-transparent 
                           hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:bg-clip-text 
                           cursor-pointer transition-all duration-300"
                  onClick={() => navigate(`/product/${deal.id}`)}>
                {deal.title}
              </h3>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  ${deal.unit_price}
                </span>
                <span className="text-sm text-gray-500 line-through font-medium">${deal.originalPrice}</span>
              </div>
              
              <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                Save ${(deal.originalPrice - deal.unit_price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealsSection;

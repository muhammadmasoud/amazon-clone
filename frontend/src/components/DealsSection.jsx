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
        const response = await getProducts(1, null, null, null, 100); // Products under $100
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
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow-sm border border-red-200">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-red-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-red-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-red-200 aspect-square rounded mb-2"></div>
              <div className="bg-red-200 h-4 rounded mb-1"></div>
              <div className="bg-red-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow-sm border border-red-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-red-600 mr-2">🔥 Today's Deals</h2>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            LIMITED TIME
          </span>
        </div>
        <button
          onClick={handleViewAllDeals}
          className="text-red-600 hover:text-red-800 font-medium hover:underline"
        >
          View all deals →
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative">
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                -{deal.discountPercent}%
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={deal.image || '/placeholder-product.svg'}
                  alt={deal.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => navigate(`/product/${deal.id}`)}
                />
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 cursor-pointer"
                onClick={() => navigate(`/product/${deal.id}`)}>
              {deal.title}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg font-bold text-red-600">${deal.unit_price}</span>
              <span className="text-sm text-gray-500 line-through">${deal.originalPrice}</span>
            </div>
            
            <div className="text-xs text-gray-500">
              Save ${(deal.originalPrice - deal.unit_price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsSection;

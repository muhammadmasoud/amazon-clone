import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories } from '../api/products';

const QuickCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category icons mapping - you can customize these
  const categoryIcons = {
    'Electronics': '📱',
    'Fashion': '�', 
    'Home & Garden': '🏠',
    'Sports': '⚽',
    'Books': '📚',
    'Health & Beauty': '💄',
    'Automotive': '🚗',
    'Toys & Games': '🎮',
    'Jewelry': '💎',
    'Music': '🎵',
    'Movies': '🎬',
    'Food': '🍔'
  };

  const categoryColors = [
    'bg-blue-500',
    'bg-pink-500', 
    'bg-green-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-gray-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-emerald-500'
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await getCategories();
        const categoriesData = response.data.slice(0, 8); // Limit to 8 categories
        
        // Add icons and colors to categories
        const categoriesWithIcons = categoriesData.map((category, index) => ({
          ...category,
          icon: categoryIcons[category.name] || '🛍️', // Default shopping icon
          color: categoryColors[index % categoryColors.length]
        }));
        
        setCategories(categoriesWithIcons);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/?category=${categoryId}&view=products`);
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-2 h-8 rounded-full mr-4 animate-pulse"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-64 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mx-auto mb-3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm overflow-hidden">
      {/* Simplified background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-2 h-8 rounded-full mr-4"></div>
          <h2 className="text-3xl font-black text-gray-900">
            Shop by Category
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group text-center p-4 rounded-2xl transition-all duration-200 
                       bg-white/90 backdrop-blur-sm border border-white/60 hover:border-white/80
                       hover:shadow-lg hover:-translate-y-1 hover:scale-102 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 
                           group-hover:scale-110 transition-transform duration-200 
                           shadow-md group-hover:shadow-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="text-2xl text-white relative z-10 group-hover:scale-105 transition-transform duration-200">
                  {category.icon}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 
                           transition-colors duration-200">
                {category.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickCategories;

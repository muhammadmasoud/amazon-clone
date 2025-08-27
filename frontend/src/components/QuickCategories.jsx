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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="text-center p-4 rounded-lg border border-gray-100 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="cursor-pointer group text-center p-4 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
          >
            <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-2xl text-white">{category.icon}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickCategories;

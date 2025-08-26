import { useState, useEffect } from 'react';
import { getCategories } from '../api/products';

function CategorySidebar({ isOpen, onClose, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-full">
          {/* All Categories Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 font-medium text-gray-900 mb-2"
          >
            All Categories
          </button>

          {/* Categories List */}
          {isLoading ? (
            <div className="animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id , category.name)}
                className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700"
              >
                {category.name}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default CategorySidebar;
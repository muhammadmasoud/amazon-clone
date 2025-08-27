import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import FilterSidebar from '../components/FilterSidebar';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState(null); // Add category state
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  
  // Add price filter state
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  
  // Add rating filter state
  const [minRating, setMinRating] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null)
        // This calls GET /api/products/
        const response = await getProducts(currentPage, selectedCategory, searchQuery, minPrice, maxPrice, minRating);
        // The data we want is in response.data
        console.log(response)
        setProducts(response.data.results);
        setTotalCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Could not load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, minPrice, maxPrice, minRating]);

    const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

    const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName || '');
    setCurrentPage(1); // Reset to first page
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1); // Reset to first page when price filter changes
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
    setCurrentPage(1); // Reset to first page when rating filter changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar - Filters - Always show */}
        <div className="hidden lg:block lg:w-64 bg-white">
          <FilterSidebar
            onCategoryChange={handleCategorySelect}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            selectedCategory={selectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
          />
        </div>

        {/* Main Content Area - Always show */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Not authenticated banner */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      Browse our products! Sign in to add items to your cart and make purchases.
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Sign In
                    </a>
                    <a
                      href="/signup"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Sign Up
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="mb-6">
              {/* Results count and filters applied */}
              <div className="text-sm text-gray-600 mb-2">
                {!isLoading && `${totalCount} results`}
                {selectedCategory && (
                  <span className="ml-2">
                    for "<span className="font-medium">{selectedCategoryName}</span>"
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-2">
                    for "<span className="font-medium">{searchQuery}</span>"
                  </span>
                )}
              </div>

              {/* Active filters display */}
              {(selectedCategory || minPrice !== null || maxPrice !== null || minRating !== null) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Category: {selectedCategoryName}
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(minPrice !== null || maxPrice !== null) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                      Price: ${minPrice || 0} - ${maxPrice || '∞'}
                      <button
                        onClick={() => handlePriceChange(null, null)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {minRating !== null && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      Rating: {minRating}+ stars
                      <button
                        onClick={() => handleRatingChange(null)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-xl font-bold text-gray-900">
                Results
              </h1>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-center">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded-md text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded mb-1"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && products.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalCount={totalCount}
                  itemsPerPage={10}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 
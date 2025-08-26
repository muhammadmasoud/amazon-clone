import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import CategorySidebar from '../components/CategorySidebar';

function Home({ showCategories, setShowCategories }) {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null)
        // This calls GET /api/products/
        const response = await getProducts(currentPage, selectedCategory , searchQuery);
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
  }, [currentPage , searchQuery, selectedCategory]);

    const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

    const handleCategorySelect = (categoryId,categoryName) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName);
    setShowCategories(false); // Close sidebar
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add CategorySidebar */}
      <CategorySidebar
        isOpen={showCategories}
        onClose={() => setShowCategories(false)}
        onSelectCategory={handleCategorySelect}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Amazon Clone
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Your one-stop shop for everything you need
          </p>
        {/* Update page title to show category */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
          {selectedCategory 
            ? `Category: ${selectedCategoryName}` 
            : searchQuery 
            ? `Search Results for "${searchQuery}"`
            : ""
          }
        </h2>
        {/* Add Clear Filter button if category is selected */}
        {selectedCategory && (
        <button
            onClick={() => setSelectedCategory(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm mb-4"
          >
            Clear Filter
          </button>
        )}
        {isAuthenticated ? (
            <div className="max-w-7xl mx-auto">
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
            ) : isLoading ? ( // <-- Note: This is the 'else' case for the error check
              <p>Loading products...</p>
            ) : ( // <-- This is the 'else' case for the loading check
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
      ) : (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Sign in to your account or create a new one to start shopping.
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full bg-[#f0c14b] border border-[#a88734] rounded-md py-2 px-4 text-sm font-medium text-gray-900 hover:bg-[#f4d078] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="block w-full bg-gray-800 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Create Account
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      {!isLoading && !error && products.length > 0 && isAuthenticated && (
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          itemsPerPage={10}
          onPageChange={handlePageChange}
        />
      )}
    </div>

  );
}

export default Home; 
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api/products';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import FilterSidebar from '../components/FilterSidebar';
import HeroSection from '../components/HeroSection';
import QuickCategories from '../components/QuickCategories';
import DealsSection from '../components/DealsSection';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryBlock from '../components/CategoryBlock';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if we're in filter/search mode
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || searchParams.get('q');
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');
  const minRatingParam = searchParams.get('min_rating');
  const viewParam = searchParams.get('view'); // Add view parameter
  
  const isFilterMode = !!(categoryParam || searchQuery || minPriceParam || maxPriceParam || minRatingParam || viewParam === 'products');

  // Home page state
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  // Filter page state
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Load categories (always needed for filter names)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await getCategories();
        const categoriesData = categoriesResponse.data;
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Load home page data
  useEffect(() => {
    if (!isFilterMode) {
      const loadHomePageData = async () => {
        try {
          setIsLoadingHome(true);
          
          // Categories are already loaded, just fetch sample products for each category
          const categoryProductsData = {};
          for (const category of categories.slice(0, 6)) { // Limit to 6 categories
            try {
              const productsResponse = await getProducts(1, category.id);
              categoryProductsData[category.id] = productsResponse.data.results.slice(0, 4);
            } catch (error) {
              console.error(`Failed to fetch products for category ${category.id}:`, error);
              categoryProductsData[category.id] = [];
            }
          }
          setCategoryProducts(categoryProductsData);
        } catch (error) {
          console.error('Failed to load home page data:', error);
        } finally {
          setIsLoadingHome(false);
        }
      };

      if (categories.length > 0) {
        loadHomePageData();
      }
    }
  }, [isFilterMode, categories]);

  // Load filtered products
  useEffect(() => {
    if (isFilterMode) {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await getProducts(
            currentPage, 
            categoryParam, 
            searchQuery, 
            minPriceParam, 
            maxPriceParam, 
            minRatingParam
          );
          
          setProducts(response.data.results);
          setTotalCount(response.data.count);
          
          // Set category name for display
          if (categoryParam && categories.length > 0) {
            const category = categories.find(cat => cat.id === parseInt(categoryParam));
            setSelectedCategoryName(category ? category.name : '');
          }
        } catch (error) {
          console.error('Failed to fetch products:', error);
          setError('Could not load products. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }
  }, [currentPage, searchQuery, categoryParam, minPriceParam, maxPriceParam, minRatingParam, isFilterMode, categories]);

  // Reset page to 1 when URL params change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, minPriceParam, maxPriceParam, minRatingParam, searchQuery, viewParam]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
      // Remove view param when a specific category is selected
      params.delete('view');
    } else {
      params.delete('category');
      // Add view=products to stay in filter mode when "All Categories" is selected
      params.set('view', 'products');
    }
    setSearchParams(params);
  };

  const handlePriceChange = (min, max) => {
    const params = new URLSearchParams(searchParams);
    if (min !== null) params.set('min_price', min);
    else params.delete('min_price');
    if (max !== null) params.set('max_price', max);
    else params.delete('max_price');
    setSearchParams(params);
  };

  const handleRatingChange = (rating) => {
    const params = new URLSearchParams(searchParams);
    if (rating !== null) params.set('min_rating', rating);
    else params.delete('min_rating');
    setSearchParams(params);
  };

  const clearFilters = () => {
    navigate('/');
  };

  // Render filter/search results page
  if (isFilterMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block lg:w-64 bg-white">
            <FilterSidebar
              onCategoryChange={handleCategorySelect}
              onPriceChange={handlePriceChange}
              onRatingChange={handleRatingChange}
              selectedCategory={categoryParam}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              minRating={minRatingParam}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 lg:ml-0">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Back to Home */}
              <div className="mb-4">
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center"
                >
                  ← Back to Home
                </button>
              </div>

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
                <div className="text-sm text-gray-600 mb-2">
                  {!isLoading && `${totalCount} results`}
                  {categoryParam && selectedCategoryName && (
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
                {(categoryParam || minPriceParam !== null || maxPriceParam !== null || minRatingParam !== null) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categoryParam && selectedCategoryName && (
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
                    {(minPriceParam !== null || maxPriceParam !== null) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                        Price: ${minPriceParam || 0} - ${maxPriceParam || '∞'}
                        <button
                          onClick={() => handlePriceChange(null, null)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {minRatingParam !== null && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                        Rating: {minRatingParam}+ stars
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

                <h1 className="text-xl font-bold text-gray-900">Results</h1>
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

  // Render Amazon-style home page
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Not authenticated banner */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  Welcome to our store! Sign in to enjoy personalized shopping and exclusive deals.
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

        {/* Hero Section */}
        <HeroSection />

        {/* Quick Categories */}
        <QuickCategories />

        {/* Today's Deals */}
        <DealsSection />

        {/* Featured Products */}
        <FeaturedProducts title="Featured Products" limit={8} />

        {/* Category Blocks */}
        {isLoadingHome ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category) => (
              <CategoryBlock
                key={category.id}
                category={category}
                products={categoryProducts[category.id] || []}
              />
            ))}
          </div>
        )}

        {/* More Featured Products by Category */}
        {categories.slice(0, 3).map((category) => (
          <FeaturedProducts
            key={`featured-${category.id}`}
            title={`Best in ${category.name}`}
            categoryId={category.id}
            limit={6}
          />
        ))}
      </div>
    </div>
  );
}

export default Home; 
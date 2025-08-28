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
  const sortByParam = searchParams.get('sort_by');
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
              const productsResponse = await getProducts(1, category.id, null, null, null, null, null);
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
            minRatingParam,
            sortByParam
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
  }, [currentPage, searchQuery, categoryParam, minPriceParam, maxPriceParam, minRatingParam, sortByParam, isFilterMode, categories]);

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

  const handleSortChange = (sortValue) => {
    const params = new URLSearchParams(searchParams);
    if (sortValue && sortValue !== 'relevance') {
      params.set('sort_by', sortValue);
    } else {
      params.delete('sort_by');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    navigate('/');
  };

  // Render filter/search results page
  if (isFilterMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="flex relative z-10">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block lg:w-64">
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
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Back to Home */}
              <div className="mb-6">
                <button
                  onClick={clearFilters}
                  className="group flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </button>
              </div>

              {/* Not authenticated banner */}
              {!isAuthenticated && (
                <div className="glass-card rounded-3xl border border-blue-200/50 mb-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900 text-lg">Welcome to Our Store!</h3>
                        <p className="text-blue-800">
                          Browse our products! Sign in to add items to your cart and make purchases.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href="/login"
                        className="btn-primary text-sm px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
                      >
                        Sign In
                      </a>
                      <a
                        href="/signup"
                        className="btn-secondary text-sm px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
                      >
                        Sign Up
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Header */}
              <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center">
                      <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Results
                    </h1>
                    <div className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {!isLoading && (
                        <span className="font-semibold text-blue-700">
                          {totalCount} products found
                        </span>
                      )}
                      {categoryParam && selectedCategoryName && (
                        <span className="ml-2 text-gray-700">
                          in "<span className="font-medium text-blue-700">{selectedCategoryName}</span>"
                        </span>
                      )}
                      {searchQuery && (
                        <span className="ml-2 text-gray-700">
                          for "<span className="font-medium text-blue-700">{searchQuery}</span>"
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick sort options */}
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                    <select 
                      value={sortByParam || 'relevance'}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-white/80 border border-gray-300/50 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>

                {/* Mobile sort dropdown */}
                <div className="md:hidden mt-4">
                  <label className="block text-sm text-gray-600 font-medium mb-2">Sort by:</label>
                  <select 
                    value={sortByParam || 'relevance'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full bg-white/80 border border-gray-300/50 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Active filters display */}
                {(categoryParam || minPriceParam !== null || maxPriceParam !== null || minRatingParam !== null) && (
                  <div className="border-t border-gray-200/50 pt-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {categoryParam && selectedCategoryName && (
                        <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {selectedCategoryName}
                          <button
                            onClick={() => handleCategorySelect(null)}
                            className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-1 transition-all duration-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {(minPriceParam !== null || maxPriceParam !== null) && (
                        <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ${minPriceParam || 0} - ${maxPriceParam || '∞'}
                          <button
                            onClick={() => handlePriceChange(null, null)}
                            className="ml-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-1 transition-all duration-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {minRatingParam !== null && (
                        <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 shadow-sm">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {minRatingParam}+ stars
                          <button
                            onClick={() => handleRatingChange(null)}
                            className="ml-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-1 transition-all duration-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {error ? (
                <div className="glass-card rounded-3xl shadow-2xl border border-red-200/50 p-12 text-center bg-gradient-to-r from-red-50/80 to-pink-50/80">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-700 bg-clip-text text-transparent mb-4">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-md mx-auto">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn-primary relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  </button>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="glass-card rounded-3xl p-6 border border-white/30 shadow-2xl">
                      <div className="animate-pulse">
                        <div className="bg-gradient-to-r from-gray-200/60 to-gray-300/60 aspect-square rounded-2xl mb-4 shimmer"></div>
                        <div className="bg-gradient-to-r from-gray-200/60 to-gray-300/60 h-5 rounded-xl mb-3 shimmer"></div>
                        <div className="bg-gradient-to-r from-gray-200/60 to-gray-300/60 h-4 rounded-xl w-3/4 mb-3 shimmer"></div>
                        <div className="bg-gradient-to-r from-gray-200/60 to-gray-300/60 h-6 rounded-xl w-1/2 shimmer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Empty state if no products found */}
                  {products.length === 0 && (
                    <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-12 text-center bg-gradient-to-r from-gray-50/80 to-blue-50/80 mt-8">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                      </p>
                      <button 
                        onClick={clearFilters}
                        className="btn-primary relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Browse All Products
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      </button>
                    </div>
                  )}

                  {/* Pagination */}
                  {!isLoading && !error && products.length > 0 && (
                    <div className="mt-12 flex justify-center">
                      <div className="glass-card rounded-3xl shadow-2xl border border-white/30 p-4">
                        <Pagination
                          currentPage={currentPage}
                          totalCount={totalCount}
                          itemsPerPage={10}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Amazon-style home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/3 to-blue-400/3 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Not authenticated banner */}
        {!isAuthenticated && (
          <div className="relative bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-xl mr-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-lg">Welcome to our store!</span>
                  <p className="text-blue-100 text-sm">Sign in to enjoy personalized shopping and exclusive deals.</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href="/login"
                  className="group bg-white text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold 
                           hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-xl
                           relative overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </a>
                <a
                  href="/signup"
                  className="group bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-xl text-sm font-bold 
                           hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl
                           border border-white/30 hover:border-white/50 relative overflow-hidden"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
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
        <FeaturedProducts title="⭐ Featured Products" limit={8} />

        {/* Category Blocks */}
        {isLoadingHome ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/30 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 w-1.5 h-6 rounded-full mr-3"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-32"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            title={`🏆 Best in ${category.name}`}
            categoryId={category.id}
            limit={6}
          />
        ))}
      </div>
    </div>
  );
}

export default Home; 
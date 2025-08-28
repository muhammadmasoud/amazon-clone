import { useState, useEffect } from 'react';
import { getCategories, getPriceRange } from '../api/products';
import './FilterSidebar.css';

function FilterSidebar({ onCategoryChange, onPriceChange, onRatingChange, selectedCategory, minPrice, maxPrice, minRating }) {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 2000 });
  const [selectedMin, setSelectedMin] = useState(0);
  const [selectedMax, setSelectedMax] = useState(2000);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingPriceRange, setIsLoadingPriceRange] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const fetchPriceRange = async () => {
      try {
        const response = await getPriceRange();
        const { min_price, max_price } = response.data;
        setPriceRange({ min_price, max_price });
        setSelectedMin(minPrice || min_price);
        setSelectedMax(maxPrice || max_price);
      } catch (error) {
        console.error('Failed to fetch price range:', error);
        setPriceRange({ min_price: 0, max_price: 2000 });
        setSelectedMin(minPrice || 0);
        setSelectedMax(maxPrice || 2000);
      } finally {
        setIsLoadingPriceRange(false);
      }
    };

    fetchCategories();
    fetchPriceRange();
  }, [minPrice, maxPrice]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), selectedMax - 1);
    setSelectedMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), selectedMin + 1);
    setSelectedMax(value);
  };

  const handleApplyPriceFilter = () => {
    onPriceChange(selectedMin, selectedMax);
  };

  const handleClearPriceFilter = () => {
    const { min_price, max_price } = priceRange;
    setSelectedMin(min_price);
    setSelectedMax(max_price);
    onPriceChange(null, null);
  };

  return (
    <div className="w-64 glass-effect border-r border-white/30 h-full overflow-y-auto backdrop-blur-xl shadow-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filters
          </h2>
          <p className="text-sm text-gray-600">Find exactly what you need</p>
        </div>

        {/* Department/Categories Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Department
          </h3>
          
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left py-3 px-4 rounded-2xl font-semibold mb-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border ${
              !selectedCategory 
                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-800 border-blue-300/50 shadow-blue-200/50' 
                : 'bg-white/60 hover:bg-white/80 text-gray-900 border-gray-200/50 hover:shadow-xl'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Categories
            </span>
          </button>

          {/* Categories List */}
          {isLoadingCategories ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id, category.name)}
                  className={`group w-full text-left py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border ${
                    selectedCategory && parseInt(selectedCategory) === category.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-800 border-blue-300/50 shadow-blue-200/50'
                      : 'bg-white/60 hover:bg-white/80 text-gray-700 border-gray-200/50 hover:shadow-xl hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {category.name}
                    </span>
                    {selectedCategory && parseInt(selectedCategory) === category.id && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Price Range
          </h3>
          
          {isLoadingPriceRange ? (
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse shimmer"></div>
              <div className="h-12 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse shimmer"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse shimmer"></div>
            </div>
          ) : (
            <div className="bg-white/60 p-5 rounded-2xl border border-gray-200/50 shadow-lg backdrop-blur-sm">
              <div className="space-y-6">
                {/* Price Range Display */}
                <div className="text-center bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-4 rounded-xl border border-green-200/50">
                  <div className="text-lg font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    ${selectedMin} - ${selectedMax}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available: ${priceRange.min_price} - ${priceRange.max_price}
                  </div>
                </div>

                {/* Dual Range Slider */}
                <div className="relative mb-6">
                  <div className="relative h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shadow-inner">
                    {/* Active track between thumbs */}
                    <div 
                      className="absolute h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg"
                      style={{
                        left: `${((selectedMin - priceRange.min_price) / (priceRange.max_price - priceRange.min_price)) * 100}%`,
                        width: `${((selectedMax - selectedMin) / (priceRange.max_price - priceRange.min_price)) * 100}%`
                      }}
                    />
                  </div>
                  
                  {/* Min Range Input */}
                  <input
                    type="range"
                    min={priceRange.min_price}
                    max={priceRange.max_price}
                    value={selectedMin}
                    onChange={handleMinChange}
                    className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer range-slider-min"
                    style={{ zIndex: selectedMin > priceRange.max_price - 100 ? 5 : 1 }}
                  />
                  
                  {/* Max Range Input */}
                  <input
                    type="range"
                    min={priceRange.min_price}
                    max={priceRange.max_price}
                    value={selectedMax}
                    onChange={handleMaxChange}
                    className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer range-slider-max"
                    style={{ zIndex: selectedMax < priceRange.min_price + 100 ? 5 : 1 }}
                  />
                </div>

                {/* Manual Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Min
                    </label>
                    <input
                      type="number"
                      min={priceRange.min_price}
                      max={selectedMax - 1}
                      value={selectedMin}
                      onChange={handleMinChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white/80 font-semibold transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Max
                    </label>
                    <input
                      type="number"
                      min={selectedMin + 1}
                      max={priceRange.max_price}
                      value={selectedMax}
                      onChange={handleMaxChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white/80 font-semibold transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleApplyPriceFilter}
                    className="btn-primary w-full relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Filter
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  </button>
                  {(minPrice !== null || maxPrice !== null) && (
                    <button
                      onClick={handleClearPriceFilter}
                      className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300/50"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Range
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Customer Reviews
          </h3>
          
          <div className="space-y-3">
            {[4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => onRatingChange(stars)}
                className={`group flex items-center w-full text-left py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border ${
                  minRating === stars
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-800 border-yellow-300/50 shadow-yellow-200/50'
                    : 'bg-white/60 hover:bg-white/80 text-gray-700 border-gray-200/50 hover:shadow-xl hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="flex mr-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < stars ? 'text-yellow-400' : 'text-gray-300'} group-hover:scale-110 transition-transform duration-200`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold">& Up</span>
                  </div>
                  {minRating === stars && (
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
            {minRating && (
              <button
                onClick={() => onRatingChange(null)}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-2xl text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300/50 mt-4"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Rating Filter
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;

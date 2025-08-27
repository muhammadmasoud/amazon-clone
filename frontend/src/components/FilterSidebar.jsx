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
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        {/* Department/Categories Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Department</h3>
          
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left py-2 px-3 rounded-md font-medium mb-2 ${
              !selectedCategory 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-50 text-gray-900'
            }`}
          >
            All Categories
          </button>

          {/* Categories List */}
          {isLoadingCategories ? (
            <div className="animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id, category.name)}
                  className={`w-full text-left py-2 px-3 rounded-md text-sm ${
                    selectedCategory && parseInt(selectedCategory) === category.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Price</h3>
          
          {isLoadingPriceRange ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Price Range Display */}
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-800">
                  ${selectedMin} - ${selectedMax}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Range: ${priceRange.min_price} - ${priceRange.max_price}
                </div>
              </div>

              {/* Dual Range Slider */}
              <div className="relative mb-6">
                <div className="relative h-2 bg-gray-200 rounded-lg">
                  {/* Active track between thumbs */}
                  <div 
                    className="absolute h-2 bg-orange-500 rounded-lg"
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
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-min"
                  style={{ zIndex: selectedMin > priceRange.max_price - 100 ? 5 : 1 }}
                />
                
                {/* Max Range Input */}
                <input
                  type="range"
                  min={priceRange.min_price}
                  max={priceRange.max_price}
                  value={selectedMax}
                  onChange={handleMaxChange}
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-max"
                  style={{ zIndex: selectedMax < priceRange.min_price + 100 ? 5 : 1 }}
                />
              </div>

              {/* Manual Input Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    min={priceRange.min_price}
                    max={selectedMax - 1}
                    value={selectedMin}
                    onChange={handleMinChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    min={selectedMin + 1}
                    max={priceRange.max_price}
                    value={selectedMax}
                    onChange={handleMaxChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleApplyPriceFilter}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
                >
                  Go
                </button>
                {(minPrice !== null || maxPrice !== null) && (
                  <button
                    onClick={handleClearPriceFilter}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-4 rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => onRatingChange(stars)}
                className={`flex items-center w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${
                  minRating === stars
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < stars ? 'text-orange-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2">& Up</span>
                {minRating === stars && (
                  <span className="ml-auto text-xs text-orange-600">✓</span>
                )}
              </button>
            ))}
            {minRating && (
              <button
                onClick={() => onRatingChange(null)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-3 rounded text-sm transition-colors mt-2"
              >
                Clear Rating Filter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;

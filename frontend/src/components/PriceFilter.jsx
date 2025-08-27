import { useState, useEffect } from 'react';
import { getPriceRange } from '../api/products';

function PriceFilter({ onPriceChange, isOpen, onClose }) {
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 1000 });
  const [selectedMin, setSelectedMin] = useState(0);
  const [selectedMax, setSelectedMax] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await getPriceRange();
        const { min_price, max_price } = response.data;
        setPriceRange({ min_price, max_price });
        setSelectedMin(min_price);
        setSelectedMax(max_price);
      } catch (error) {
        console.error('Failed to fetch price range:', error);
        // Use default values if API fails
        setPriceRange({ min_price: 0, max_price: 1000 });
        setSelectedMin(0);
        setSelectedMax(1000);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPriceRange();
    }
  }, [isOpen]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), selectedMax - 1);
    setSelectedMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), selectedMin + 1);
    setSelectedMax(value);
  };

  const handleApplyFilter = () => {
    onPriceChange(selectedMin, selectedMax);
    onClose();
  };

  const handleClearFilter = () => {
    setSelectedMin(priceRange.min_price);
    setSelectedMax(priceRange.max_price);
    onPriceChange(null, null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Price Filter Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Filter by Price</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Price Range Display */}
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  ${selectedMin} - ${selectedMax}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Range: ${priceRange.min_price} - ${priceRange.max_price}
                </div>
              </div>

              {/* Dual Range Slider */}
              <div className="relative">
                <div className="relative h-2 bg-gray-200 rounded-lg">
                  {/* Track between thumbs */}
                  <div 
                    className="absolute h-2 bg-blue-500 rounded-lg"
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
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 2 }}
                />
                
                {/* Max Range Input */}
                <input
                  type="range"
                  min={priceRange.min_price}
                  max={priceRange.max_price}
                  value={selectedMax}
                  onChange={handleMaxChange}
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 3 }}
                />
              </div>

              {/* Manual Input Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min={priceRange.min_price}
                    max={selectedMax - 1}
                    value={selectedMin}
                    onChange={handleMinChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min={selectedMin + 1}
                    max={priceRange.max_price}
                    value={selectedMax}
                    onChange={handleMaxChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleClearFilter}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for range slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}

export default PriceFilter;

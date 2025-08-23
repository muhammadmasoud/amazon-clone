function ProductActionButtons({ product }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <button 
        disabled={product.stock === 0}
        className={`flex-1 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          product.stock === 0 
            ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
            : 'bg-[#febd69] hover:bg-[#f3a847] text-gray-900 focus:ring-yellow-500'
        }`}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
      <button 
        disabled={product.stock === 0}
        className={`flex-1 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          product.stock === 0 
            ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
            : 'bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 border-[#ff8f00] focus:ring-yellow-500'
        }`}
      >
        Buy Now
      </button>
    </div>
  );
}

export default ProductActionButtons;
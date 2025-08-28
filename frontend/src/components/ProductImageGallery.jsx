function ProductImageGallery({ image }) {
  return (
    <div className="space-y-6">
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg group">
        {image ? (
          <>
            <img
              src={image}
              alt="Main product"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {/* Zoom overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center space-x-2 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span className="text-sm font-medium">Hover to zoom</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-16 h-16 mb-4 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-500">No Image Available</span>
            <span className="text-sm text-gray-400 mt-1">Product image will appear here</span>
          </div>
        )}
      </div>
      
      {/* Image gallery thumbnails (placeholder for future enhancement) */}
      <div className="flex space-x-3">
        {image && (
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md border-2 border-blue-400">
            <img
              src={image}
              alt="Thumbnail"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {/* Placeholder thumbnails */}
        {[1, 2, 3].map((_, index) => (
          <div 
            key={index}
            className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex items-center justify-center opacity-50"
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductImageGallery;
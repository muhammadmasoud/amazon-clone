function ProductImageGallery({ image }) {
  return (
    <div className="space-y-4">
      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        {image ? (
          <img
            src={image}
            alt="Main product"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageGallery;
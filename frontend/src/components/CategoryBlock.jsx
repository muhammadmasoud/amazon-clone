import { useNavigate } from 'react-router-dom';

const CategoryBlock = ({ category, products = [] }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate(`/?category=${category.id}&view=products`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="group relative bg-white/85 backdrop-blur-lg p-6 rounded-2xl shadow-2xl 
                  hover:shadow-3xl transition-all duration-500 border border-white/40 hover:border-white/60 
                  overflow-hidden hover:-translate-y-2 hover:scale-105 active:scale-95">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-400/8 to-pink-400/8 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-1.5 h-6 rounded-full mr-3"></div>
            <h3 className="text-xl font-black text-gray-900 group-hover:text-transparent 
                         group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 
                         group-hover:bg-clip-text transition-all duration-300">
              {category.name}
            </h3>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
            {category.description}
          </p>
        </div>
        
        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="cursor-pointer group/item relative overflow-hidden rounded-xl"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden 
                              group-hover/item:scale-110 transition-all duration-500 relative">
                  <img
                    src={product.image || '/placeholder-product.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 
                                group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  {/* Product title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full 
                                group-hover/item:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-bold drop-shadow-lg line-clamp-1">
                      {product.title}
                    </p>
                  </div>
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                              -translate-x-full group-hover/item:translate-x-full transition-transform duration-700 ease-out rounded-xl"></div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={handleCategoryClick}
          className="group/btn w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl 
                   hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl
                   relative overflow-hidden active:scale-95"
        >
          <span className="relative z-10 group-hover/btn:mr-2 transition-all duration-300">
            Shop all {category.name.toLowerCase()}
          </span>
          <span className="relative z-10 inline-block group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
        </button>
      </div>
      
      {/* Main card shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
    </div>
  );
};

export default CategoryBlock;
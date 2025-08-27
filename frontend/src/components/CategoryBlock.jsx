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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
      </div>
      
      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {products.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className="cursor-pointer group"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.image || '/placeholder-product.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{product.title}</p>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={handleCategoryClick}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
      >
        Shop all {category.name.toLowerCase()} →
      </button>
    </div>
  );
};

export default CategoryBlock;
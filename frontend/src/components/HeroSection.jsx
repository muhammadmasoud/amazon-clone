import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories } from '../api/products';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const categoriesData = response.data;
        setCategories(categoriesData);
        
        // Create hero slides from categories
        const slides = categoriesData.slice(0, 3).map((category, index) => {
          const images = [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80"
          ];
          
          return {
            id: category.id,
            title: `Great deals on ${category.name.toLowerCase()}`,
            subtitle: `Shop now for the best ${category.name.toLowerCase()} at unbeatable prices`,
            image: images[index % images.length],
            category: category.name,
            categoryId: category.id
          };
        });
        
        // Add a default slide if no categories
        if (slides.length === 0) {
          slides.push({
            id: 'default',
            title: "Welcome to our store",
            subtitle: "Discover amazing products at great prices",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            category: "All Products",
            categoryId: null
          });
        }
        
        setHeroSlides(slides);
      } catch (error) {
        console.error('Failed to fetch categories for hero:', error);
        // Fallback slides
        setHeroSlides([
          {
            id: 'default',
            title: "Welcome to our store",
            subtitle: "Discover amazing products at great prices",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            category: "All Products",
            categoryId: null
          }
        ]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (heroSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [heroSlides.length]);

  const handleSlideClick = (categoryId) => {
    if (categoryId) {
      navigate(`/?category=${categoryId}&view=products`);
    } else {
      navigate('/');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (heroSlides.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg shadow-lg bg-gray-200 animate-pulse">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg shadow-lg">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="h-full bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${slide.image})` }}
            onClick={() => handleSlideClick(slide.categoryId)}
          >
            <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide.categoryId);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-200"
                >
                  Shop {slide.category}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;

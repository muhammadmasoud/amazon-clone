import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 'mega-sale',
      title: "Mega Summer Sale",
      subtitle: "Save up to 80% on thousands of items",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      buttonText: "Shop All Deals",
      bgColor: "from-red-600 to-pink-600"
    },
    {
      id: 'electronics',
      title: "Latest Electronics",
      subtitle: "Cutting-edge tech at unbeatable prices",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      buttonText: "Explore Tech",
      bgColor: "from-blue-600 to-purple-600"
    },
    {
      id: 'fashion',
      title: "Fashion Trends",
      subtitle: "Style that speaks volumes",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      buttonText: "Shop Fashion",
      bgColor: "from-purple-600 to-indigo-600"
    },
    {
      id: 'home',
      title: "Home Essentials",
      subtitle: "Make your house a home",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      buttonText: "Shop Home",
      bgColor: "from-green-600 to-teal-600"
    },
    {
      id: 'gaming',
      title: "Gaming Zone",
      subtitle: "Gear up for victory",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      buttonText: "Level Up",
      bgColor: "from-orange-600 to-red-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handleSlideClick = (slideId) => {
    switch(slideId) {
      case 'electronics': navigate('/?category=Electronics'); break;
      case 'fashion': navigate('/?category=Clothing'); break;
      case 'home': navigate('/?category=Home'); break;
      case 'gaming': navigate('/?category=Gaming'); break;
      default: navigate('/'); break;
    }
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl">
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${slide.image})` }}
              onClick={() => handleSlideClick(slide.id)}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-75`} />
            <div className="relative z-10 flex items-center h-full px-8 md:px-16">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light opacity-90">
                  {slide.subtitle}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide.id);
                  }}
                  className="group relative px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full 
                           transition-all duration-300 hover:bg-gray-100 hover:scale-105 
                           shadow-lg hover:shadow-xl transform active:scale-95"
                >
                  <span className="relative z-10">{slide.buttonText}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                                rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20
                 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full
                 flex items-center justify-center text-white
                 hover:bg-white/30 transition-all duration-300 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20
                 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full
                 flex items-center justify-center text-white
                 hover:bg-white/30 transition-all duration-300 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-20">
        <div
          className="h-full bg-white transition-all duration-5000 ease-linear"
          style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSection;

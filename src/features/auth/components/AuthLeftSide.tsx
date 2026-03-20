import { useState, useEffect } from 'react';

// Define the carousel content
const howItWorksSlides = [
  {
    id: 1,
    title: 'Find Your Perfect Stay',
    description:
      'Browse through our curated selection of shortlets that match your preferences and budget.',
    image: '/authsidepane1.png', // Replace with your actual image
  },
  {
    id: 2,
    title: 'Book with Ease',
    description:
      'Simple booking process with secure payments and instant confirmation.',
    image: '/authsidepane2.png', // Replace with your actual image
  },
  {
    id: 3,
    title: 'Enjoy Your Experience',
    description:
      'Check in to your comfortable space and enjoy a memorable stay with premium amenities.',
    image: '/authsidepane3.png', // Replace with your actual image
  },
];

export default function AuthLeftSide() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === howItWorksSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="w-full lg:w-1/2 h-full relative hidden lg:block">
      <div className="relative h-full overflow-hidden bg-[#1D5C5C]">
        {/* Slides */}
        {howItWorksSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1D5C5C] bg-opacity-60"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 md:p-8">
              <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                {slide.title}
              </h2>
              <p className="text-white text-base md:text-lg max-w-md">
                {slide.description}
              </p>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {howItWorksSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white scale-110' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Logo or Brand (optional) */}
        <div className="absolute top-6 left-6 z-20">
          <img src="/CribXpert.svg" alt="Logo" className="h-10 md:h-12" />
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  imageAlt?: string;
  className?: string;
  imageClassName?: string;
  containerClassName?: string;
}

export function ImageCarousel({
  images,
  imageAlt = "Image",
  className = "",
  imageClassName = "",
  containerClassName = "",
}: ImageCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors'
          aria-label='Scroll left'
        >
          <ChevronLeft className='w-5 h-5 text-gray-700' />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors'
          aria-label='Scroll right'
        >
          <ChevronRight className='w-5 h-5 text-gray-700' />
        </button>
      )}

      {/* Images Container */}
      <div
        ref={scrollContainerRef}
        className={`flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden ${containerClassName}`}
        onScroll={checkScrollPosition}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-48 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden ${imageClassName}`}
          >
            <img
              src={image}
              alt={`${imageAlt} - View ${index + 1}`}
              className='w-full h-full object-cover'
            />
          </div>
        ))}
      </div>
    </div>
  );
}

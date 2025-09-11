interface CarouselDotsProps {
  totalDots?: number;
  activeDot?: number;
  className?: string;
}

export function CarouselDots({
  totalDots = 5,
  activeDot = 0,
  className = "",
}: CarouselDotsProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[...Array(totalDots)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i === activeDot ? "bg-white" : "bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

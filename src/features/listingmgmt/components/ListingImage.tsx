import React, { useState, useCallback } from "react";
import { ListingStatusBadge } from "@/features/listingmgmt/components/ListingStatusBadge";

interface ListingImageProps {
  src: string;
  alt: string;
  status: "pending" | "active" | "flagged" | "rejected";
  className?: string;
  priority?: boolean;
}

export const ListingImage = React.memo<ListingImageProps>(
  ({ src, alt, status, className = "", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => setIsLoaded(true), []);
    const handleError = useCallback(() => setHasError(true), []);

    return (
      <div className={`relative h-48 rounded-xl bg-gray-100 overflow-hidden ${className}`}>
        {!isLoaded && !hasError && (
          <div className='absolute inset-0 bg-gray-200 animate-pulse' />
        )}

        {hasError ? (
          <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
            <span className='text-sm'>Image unavailable</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div className='absolute top-2 right-2'>
          <ListingStatusBadge status={status} />
        </div>
      </div>
    );
  }
);

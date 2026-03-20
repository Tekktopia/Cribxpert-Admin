import { MapPin } from "lucide-react";

interface ListingInfoProps {
  id: string;
  title: string;
  hostName: string;
  location: string;
  price: string;
  basePrice?: number;
  cleaningFee?: number;
  created: string;
  onHostClick?: () => void;
}

export const ListingInfo = ({
  id,
  title,
  hostName,
  location,
  price,
  basePrice,
  cleaningFee,
  created,
  onHostClick,
}: ListingInfoProps) => {
  const accommodationFee =
    basePrice !== undefined
      ? (basePrice + (cleaningFee ?? 0)).toLocaleString()
      : null;

  return (
    <div>
      <h3
        id={`listing-title-${id}`}
        className='font-semibold text-lg text-gray-900 mb-2'
      >
        {title}
      </h3>

      <div className='space-y-2 text-sm text-gray-600'>
        <p>
          Host:{" "}
          {onHostClick ? (
            <button
              onClick={onHostClick}
              className='text-primary-600 underline hover:text-primary-800 transition-colors font-medium'
            >
              {hostName}
            </button>
          ) : (
            hostName
          )}
        </p>

        <div className='flex items-center'>
          <MapPin className='w-4 h-4 mr-1' />
          {location}
        </div>

        {accommodationFee ? (
          <div>
            <div className='font-semibold text-lg text-gray-900'>
              NGN {accommodationFee}/night
            </div>
            <div className='text-xs text-gray-400'>Accommodation fee · excl. taxes & fees</div>
          </div>
        ) : (
          <div className='font-semibold text-lg text-gray-900'>{price}</div>
        )}

        <div className='text-gray-500'>Created {created}</div>
      </div>
    </div>
  );
};
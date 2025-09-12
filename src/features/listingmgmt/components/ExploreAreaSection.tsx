import { MapPin, Plane, ChevronRight } from "lucide-react";

interface ExploreAreaSectionProps {
  className?: string;
}

export function ExploreAreaSection({
  className = "",
}: ExploreAreaSectionProps) {
  const nearbyPlaces = [
    {
      name: "Trans Amusement Children's Museum",
      distance: "2 min walk",
      icon: MapPin,
    },
    {
      name: "Ventura Mall",
      distance: "10 min walk",
      icon: MapPin,
    },
    {
      name: "National Airport Station",
      distance: "24 min walk",
      icon: Plane,
    },
  ];

  return (
    <div className={className}>
      <h3 className='text-lg font-semibold mb-4'>Explore The Area</h3>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Map Section */}
        <div className='relative'>
          <div className='w-full h-64 bg-green-100 rounded-lg overflow-hidden relative'>
            {/* Placeholder map with location marker */}
            <div className='absolute inset-0 bg-gradient-to-br from-green-200 to-green-300'>
              {/* Map placeholder content */}
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                  <MapPin className='w-6 h-6 text-white' />
                </div>
              </div>
              {/* Map grid lines for realistic look */}
              <div className='absolute inset-0 opacity-20'>
                <div className='grid grid-cols-8 h-full'>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className='border-r border-gray-400'></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations List */}
        <div className='space-y-4'>
          {nearbyPlaces.map((place, index) => {
            const Icon = place.icon;
            return (
              <div key={index} className='flex items-center gap-3'>
                <div className='w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0'>
                  <Icon className='w-3 h-3 text-gray-600' />
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>{place.name}</div>
                  <div className='text-sm text-gray-500'>{place.distance}</div>
                </div>
              </div>
            );
          })}

          <button className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mt-4'>
            <span className='text-sm'>See more about area</span>
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Federal Capital Territory Guidance */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <p className='text-sm text-gray-600 mb-2'>
          Federal Capital Territory Gombe
        </p>
        <button className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'>
          <span className='text-sm'>View in map</span>
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

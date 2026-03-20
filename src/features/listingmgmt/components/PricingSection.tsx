interface PricingSectionProps {
  basePrice?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  currency?: string;
  period?: string;
}

export function PricingSection({
  basePrice = 0,
  cleaningFee,
  securityDeposit,
  currency = "NGN",
  period = "night",
}: PricingSectionProps) {
  const formatPrice = (price: number) => price.toLocaleString();

  const accommodationFee = basePrice + (cleaningFee ?? 0);

  return (
    <div className='bg-[#E6EFF1] p-4 space-y-3'>
      <h3 className='text-sm font-medium text-gray-600 mb-2'>Pricing</h3>
      <div>
        <p className='text-2xl font-bold text-gray-900'>
          {currency} {formatPrice(accommodationFee)}/{period}
        </p>
        <p className='text-xs text-gray-400'>Accommodation fee · excl. taxes & fees</p>
      </div>
      <div className='pt-2 border-t border-gray-300 space-y-2'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Base Price:</span>
          <span className='text-sm font-medium text-gray-900'>
            {currency} {formatPrice(basePrice)}
          </span>
        </div>
        {cleaningFee !== undefined && cleaningFee > 0 && (
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>Cleaning Fee:</span>
            <span className='text-sm font-medium text-gray-900'>
              {currency} {formatPrice(cleaningFee)}
            </span>
          </div>
        )}
        {securityDeposit !== undefined && securityDeposit > 0 && (
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>Security Deposit:</span>
            <span className='text-sm font-medium text-gray-900'>
              {currency} {formatPrice(securityDeposit)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
interface PricingSectionProps {
  price?: number;
  currency?: string;
  period?: string;
}

export function PricingSection({
  price = 85000,
  currency = "NGN",
  period = "night",
}: PricingSectionProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <div className='bg-[#E6EFF1] p-4'>
      <h3 className='text-sm font-medium text-gray-600 mb-2'>Pricing</h3>
      <p className='text-2xl font-bold text-gray-900'>
        {currency} {formatPrice(price)}/{period}
      </p>
    </div>
  );
}

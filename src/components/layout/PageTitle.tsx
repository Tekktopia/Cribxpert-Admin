export default function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className='flex items-start justify-between'>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900'>
          {title}
        </h1>
        {subtitle && (
          <p className='text-sm text-gray-500 mt-1'>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

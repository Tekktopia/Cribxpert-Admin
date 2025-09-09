import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/ui/SvgIcon";

interface EmptyStateProps {
  iconUrl: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ iconUrl, title, subtitle }: EmptyStateProps) {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center max-w-md'>
        <SvgIcon src={iconUrl} width={200} height={200} className='' />

        <h3 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h3>
        <p className='text-gray-500 mb-6'>{subtitle}</p>

        <Button
          className='bg-primary-600 hover:bg-primary-700 hover:cursor-pointer text-white px-6 py-2'
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

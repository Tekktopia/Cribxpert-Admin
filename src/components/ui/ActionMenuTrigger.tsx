import { Button } from "@/components/ui/button";

export function ActionMenuTrigger() {
  return (
    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 hover:bg-gray-100'>
      <svg
        className='h-4 w-4'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
        />
      </svg>
    </Button>
  );
}

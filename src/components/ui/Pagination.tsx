import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  showGoToPage?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  showGoToPage = true,
  className = "",
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display - simplified to match Figma design
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    // Show only up to 5 pages to match Figma design
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // First page and pages around current
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Last page if not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handleGoToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const page = parseInt(formData.get("page") as string);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Clear the input
      (e.currentTarget.querySelector("input") as HTMLInputElement).value = "";
    }
  };

  return (
    <div
      className={`bg-white px-6 py-4 flex items-center justify-between ${className}`}
    >
      <div className='flex items-center space-x-8 w-full'>
        {/* Rows per Page */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-600'>Rows per Page</span>
            <div className='relative'>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                className='appearance-none bg-white border border-gray-200 rounded pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500'
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className='flex items-center space-x-1'>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='flex items-center px-4 border-[2px] border-[#E2E8F0] rounded-xl py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronLeft className='w-4 h-4 mr-1' />
            Prev
          </button>

          {/* Page Numbers */}
          <div className='flex items-center'>
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className='px-2 py-1 text-sm text-gray-500'>...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[32px] h-8 flex items-center justify-center text-sm rounded ${
                      currentPage === page
                        ? "bg-[#EEEEF1]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className='flex items-center px-4 border-[2px] border-[#E2E8F0] rounded-xl py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
            <ChevronRight className='w-4 h-4 ml-1' />
          </button>
        </div>

        {/* Right Side - Go to Page and Results */}
        <div className='flex items-center space-x-6 ml-auto'>
          {showGoToPage && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>/</span>
              <span className='text-sm text-gray-600'>Go to Page</span>
              <form
                onSubmit={handleGoToPage}
                className='flex items-center space-x-2'
              >
                <input
                  type='number'
                  name='page'
                  min='1'
                  max={totalPages}
                  placeholder={currentPage.toString()}
                  className='w-12 h-8 px-2 text-sm border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500'
                />
                <button
                  type='submit'
                  className='px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded'
                >
                  Go
                </button>
              </form>
            </div>
          )}

          <span className='text-sm text-gray-600 whitespace-nowrap'>
            Showing {startItem} - {endItem} of {totalItems}
          </span>
        </div>
      </div>
    </div>
  );
}

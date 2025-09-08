import React from "react";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "@/hooks/usePagination";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  render: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowAction?: (item: T, action: string) => void;
  renderRowAction?: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  showCheckboxes?: boolean;
  showPagination?: boolean;
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  maxHeight?: string;
  className?: string;
  tableClassName?: string;
  onSelectionChange?: (selectedItems: T[]) => void;
}

export function DataTable<T>({
  data,
  columns,
  //   onRowAction,
  renderRowAction,
  keyExtractor,
  showCheckboxes = true,
  showPagination = true,
  initialItemsPerPage = 10,
  itemsPerPageOptions = [10, 25, 50, 100],
  maxHeight = "400px",
  className = "",
  tableClassName = "",
  onSelectionChange,
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = React.useState<
    Set<string | number>
  >(new Set());
  const pagination = usePagination(data.length, initialItemsPerPage);
  const paginatedData = showPagination ? pagination.slice(data) : data;

  // Handle individual checkbox selection
  const handleItemSelection = (itemKey: string | number, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(itemKey);
    } else {
      newSelection.delete(itemKey);
    }
    setSelectedItems(newSelection);

    if (onSelectionChange) {
      const selectedData = data.filter((item) =>
        newSelection.has(keyExtractor(item))
      );
      onSelectionChange(selectedData);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(paginatedData.map(keyExtractor));
      setSelectedItems(allKeys);
      if (onSelectionChange) {
        onSelectionChange(paginatedData);
      }
    } else {
      setSelectedItems(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedItems.has(keyExtractor(item)));
  const isIndeterminate =
    paginatedData.some((item) => selectedItems.has(keyExtractor(item))) &&
    !isAllSelected;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Table container with fixed height and scrolling */}
      <div className='overflow-auto' style={{ maxHeight }}>
        <table
          className={`min-w-full divide-y divide-gray-200 ${tableClassName}`}
        >
          <thead className='bg-gray-50 sticky top-0 z-10'>
            <tr>
              {showCheckboxes && (
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-12'>
                  <input
                    type='checkbox'
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded accent-primary-600'
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                    column.width || ""
                  } ${column.headerClassName || ""}`}
                >
                  {column.header}
                </th>
              ))}
              {renderRowAction && (
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-16'>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedData.map((item) => {
              const itemKey = keyExtractor(item);
              return (
                <tr key={itemKey} className='hover:bg-gray-50'>
                  {showCheckboxes && (
                    <td className='px-6 py-4 whitespace-nowrap w-12'>
                      <input
                        type='checkbox'
                        checked={selectedItems.has(itemKey)}
                        onChange={(e) =>
                          handleItemSelection(itemKey, e.target.checked)
                        }
                        className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded accent-primary-600'
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap ${
                        column.width || ""
                      } ${column.cellClassName || ""}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                  {renderRowAction && (
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-16'>
                      {renderRowAction(item)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
          showItemsPerPage={true}
          showGoToPage={true}
          itemsPerPageOptions={itemsPerPageOptions}
        />
      )}
    </div>
  );
}

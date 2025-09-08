# Pagination Component Usage Guide

## Overview

The `Pagination` component is a reusable pagination solution that works with any table or list in the dashboard. It includes features like:

- Page navigation with ellipsis for large page counts
- Items per page selection
- "Go to page" functionality
- Mobile-responsive design
- Accessible keyboard navigation

## Quick Setup

### 1. Import the hook and component

```tsx
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../../components/ui/Pagination";
```

### 2. Use the hook in your component

```tsx
function MyTableComponent({ data }) {
  // Initialize pagination with total items and items per page
  const pagination = usePagination(data.length, 10);

  // Get paginated data
  const paginatedData = pagination.slice(data);

  return (
    <div>
      {/* Your table/list using paginatedData */}
      <table>
        {/* ... */}
        {paginatedData.map((item) => (
          <tr key={item.id}>{/* Your table rows */}</tr>
        ))}
      </table>

      {/* Pagination component */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
        showItemsPerPage={true}
        showGoToPage={true}
      />
    </div>
  );
}
```

## Component Props

### Required Props

- `currentPage: number` - Current active page
- `totalPages: number` - Total number of pages
- `totalItems: number` - Total number of items
- `itemsPerPage: number` - Items per page
- `onPageChange: (page: number) => void` - Page change handler

### Optional Props

- `onItemsPerPageChange?: (itemsPerPage: number) => void` - Items per page change handler
- `showItemsPerPage?: boolean` - Show items per page selector (default: true)
- `itemsPerPageOptions?: number[]` - Options for items per page (default: [10, 25, 50, 100])
- `showGoToPage?: boolean` - Show "Go to page" input (default: true)
- `className?: string` - Additional CSS classes

## Hook Usage

The `usePagination` hook provides:

```tsx
const pagination = usePagination(totalItems, initialItemsPerPage);

// Returns:
{
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
  slice: (data) => data.slice(startIndex, endIndex)
}
```

## Examples

### Basic Table Pagination

```tsx
function ProductTable({ products }) {
  const pagination = usePagination(products.length, 25);
  const paginatedProducts = pagination.slice(products);

  return (
    <div className='bg-white rounded-lg border'>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination {...pagination} />
    </div>
  );
}
```

### Custom Items Per Page Options

```tsx
<Pagination
  {...pagination}
  itemsPerPageOptions={[5, 10, 20, 50]}
  showGoToPage={false}
/>
```

### Minimal Pagination (No Extra Features)

```tsx
<Pagination {...pagination} showItemsPerPage={false} showGoToPage={false} />
```

## Styling

The component uses Tailwind CSS classes and follows the design system. You can customize it by:

1. Passing additional classes via `className` prop
2. Modifying the component's internal styles
3. Using CSS custom properties for primary colors

## Accessibility Features

- ARIA labels for screen readers
- Keyboard navigation support
- Disabled states for navigation buttons
- Semantic HTML structure
- Focus management

## Mobile Responsiveness

- Simplified pagination controls on mobile
- Stacked layout for smaller screens
- Touch-friendly button sizes
- Responsive text and spacing

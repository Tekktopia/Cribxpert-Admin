# SearchAndFilters Component

A flexible and reusable search and filtering component for admin interfaces.

## Features

- **Dynamic Search**: Configurable search input with custom placeholder
- **Flexible Filters**: Support for multiple filter types with custom options
- **Action Buttons**: Configurable action buttons with different variants
- **Active Filters Display**: Shows currently applied filters with clear functionality
- **Results Information**: Displays filtered vs total results count
- **Responsive Design**: Works on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

## Basic Usage

```tsx
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "../ui/SearchAndFilters";

function MyComponent() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "All Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const actionButtons: ActionButton[] = [
    {
      label: "Export",
      onClick: () => console.log("Export"),
      variant: "primary",
    },
  ];

  return (
    <SearchAndFilters
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search items...'
      filters={filters}
      actionButtons={actionButtons}
    />
  );
}
```

## Props

### Required Props

- `searchValue: string` - Current search input value
- `onSearchChange: (value: string) => void` - Search input change handler

### Optional Props

- `searchPlaceholder?: string` - Placeholder text for search input (default: "Search...")
- `filters?: FilterConfig[]` - Array of filter configurations
- `actionButtons?: ActionButton[]` - Array of action button configurations
- `resultsInfo?: ResultsInfo` - Information about filtered results
- `showActiveFilters?: boolean` - Whether to show active filters (default: true)
- `onClearFilters?: () => void` - Handler to clear all filters
- `className?: string` - Additional CSS classes

## Types

### FilterConfig

```tsx
interface FilterConfig {
  key: string; // Unique identifier for the filter
  label: string; // Display label for "all" option
  options: FilterOption[]; // Available filter options
  value: string; // Current filter value
  onChange: (value: string) => void; // Change handler
}
```

### FilterOption

```tsx
interface FilterOption {
  value: string; // Option value
  label: string; // Option display text
}
```

### ActionButton

```tsx
interface ActionButton {
  label: string; // Button text
  icon?: React.ReactNode; // Optional icon
  onClick: () => void; // Click handler
  variant?: "primary" | "secondary" | "outline"; // Button style
  className?: string; // Additional CSS classes
}
```

### ResultsInfo

```tsx
interface ResultsInfo {
  total: number; // Total number of items
  filtered: number; // Number of filtered items
  entityName: string; // Name of entities (e.g., "users", "listings")
}
```

## Button Variants

- **primary**: Blue background with white text
- **secondary**: Gray background with dark text
- **outline**: White background with border

## Examples

### User Management

```tsx
const userFilters: FilterConfig[] = [
  {
    key: "role",
    label: "All Roles",
    value: roleFilter,
    onChange: setRoleFilter,
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
  },
];
```

### Listings Management

```tsx
const listingFilters: FilterConfig[] = [
  {
    key: "status",
    label: "All Status",
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    key: "category",
    label: "All Categories",
    value: categoryFilter,
    onChange: setCategoryFilter,
    options: [
      { value: "apartment", label: "Apartment" },
      { value: "house", label: "House" },
    ],
  },
];
```

## Styling

The component uses Tailwind CSS classes and can be customized by:

1. Passing additional classes via the `className` prop
2. Modifying the component's internal styles
3. Using CSS custom properties for theming

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels are provided
- Color contrast meets WCAG guidelines
- Screen reader friendly

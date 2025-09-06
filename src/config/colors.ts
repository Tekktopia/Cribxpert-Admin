// Centralized color configuration
// Change the primary color here and it will be applied throughout the app
export const colors = {
  primary: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#006073", // Main primary color - change this to update everywhere
    700: "#004d5a",
    800: "#134e4a",
    900: "#134e4a",
  },
} as const;

// For Recharts and other libraries that need hex values
export const chartColors = {
  primary: colors.primary[600],
  primaryHover: colors.primary[700],
  primaryLight: colors.primary[500],
  primaryDark: colors.primary[800],
} as const;

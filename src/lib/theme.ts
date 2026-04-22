import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      900: '#082f49',
    },
    secondary: {
      50: '#f5f3ff',
      500: '#a78bfa',
      600: '#9333ea',
      900: '#4c1d95',
    },
    success: {
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      500: '#eab308',
      600: '#ca8a04',
    },
    danger: {
      500: '#ef4444',
      600: '#dc2626',
    },
  },
  fonts: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
    },
  },
})

export default theme

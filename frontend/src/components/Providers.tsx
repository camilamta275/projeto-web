'use client'

import React from 'react'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from '@/lib/theme'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <ColorModeScript initialColorMode="light" />
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </>
  )
}

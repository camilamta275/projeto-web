'use client'

import React from 'react'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from '@/lib/theme'
import { AuthInitializer } from './AuthInitializer'
import { ChunkErrorHandler } from './ChunkErrorHandler'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <ColorModeScript initialColorMode="light" />
      <ChakraProvider theme={theme}>
        <ChunkErrorHandler />
        <AuthInitializer>{children}</AuthInitializer>
      </ChakraProvider>
    </>
  )
}

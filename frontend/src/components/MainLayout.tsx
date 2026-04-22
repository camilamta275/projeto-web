'use client'

import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <Box minHeight="100vh">
      <Header />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box
        ml={{ base: 0, md: 250 }}
        pt={4}
        px={4}
      >
        {children}
      </Box>
    </Box>
  )
}


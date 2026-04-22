'use client'

import React from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      boxShadow="0 -2px 4px rgba(0,0,0,0.1)"
      display={{ base: 'flex', md: 'none' }}
      zIndex={100}
    >
      <HStack width="100%" spacing={0} justify="space-around" py={2}>
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <VStack spacing={1} cursor="pointer" opacity={isActive ? 1 : 0.6}>
                <Text fontSize="xl">{item.icon}</Text>
                <Text fontSize="xs" fontWeight={isActive ? 'bold' : 'normal'}>
                  {item.label}
                </Text>
              </VStack>
            </Link>
          )
        })}
      </HStack>
    </Box>
  )
}


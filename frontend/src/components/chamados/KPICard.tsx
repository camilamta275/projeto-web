'use client'

import React from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'

interface KPICardProps {
  label: string
  value: number
  icon: string
  color?: string
  bgColor?: string
}

export function KPICard({ label, value, icon, color = 'blue', bgColor = 'blue.50' }: KPICardProps) {
  return (
    <Box bg={bgColor} p={4} borderRadius="lg" border="1px" borderColor={`${color}.200`}>
      <VStack align="start" spacing={2}>
        <HStack justify="space-between" width="100%">
          <Text fontSize="2xl">{icon}</Text>
          <Text fontSize="xs" color="gray.500" fontWeight="bold">
            {label}
          </Text>
        </HStack>
        <Text fontSize="2xl" fontWeight="bold" color={`${color}.700`}>
          {value}
        </Text>
      </VStack>
    </Box>
  )
}

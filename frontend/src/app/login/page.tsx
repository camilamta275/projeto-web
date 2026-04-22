'use client'

import React from 'react'
import { Container, Box, VStack } from '@chakra-ui/react'
import { LoginForm } from '@/components'

export default function LoginPage() {
  return (
    <Box minHeight="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <Container maxW="md" centerContent py={20}>
        <VStack spacing={8} width="100%">
          <Box width="100%" bg="white" borderRadius="lg" p={8}>
            <LoginForm />
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

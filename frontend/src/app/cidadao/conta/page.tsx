'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react'
import { useAuthStore } from '@/stores/authStore'
import { CitizenAccountInfo } from '@/components/layout/CitizenAccountInfo'

export default function ContaPage() {
  const router = useRouter()
  const { usuario, isLoading, sessionChecked, fetchMe } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (usuario || !sessionChecked || isLoading) return

    const refreshAccount = async () => {
      setIsRefreshing(true)
      await fetchMe()
      setIsRefreshing(false)
    }

    void refreshAccount()
  }, [usuario, sessionChecked, isLoading, fetchMe])

  React.useEffect(() => {
    if (sessionChecked && !isLoading && !isRefreshing && !usuario) {
      router.push('/login')
    }
  }, [sessionChecked, isLoading, isRefreshing, usuario, router])

  const showLoading = !sessionChecked || isLoading || isRefreshing

  if (showLoading) {
    return (
      <Container maxW="container.md" py={{ base: 6, md: 8 }}>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Skeleton height="28px" width="180px" mb={2} />
            <Skeleton height="16px" width="260px" />
          </Box>
          <Box bg="white" borderRadius="lg" p={6} boxShadow="sm">
            <AccountSkeleton />
          </Box>
        </VStack>
      </Container>
    )
  }

  if (!usuario) {
    return null
  }

  return (
    <Container maxW="container.md" py={{ base: 6, md: 8 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Minha Conta
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Visualize suas informações de cadastro. Os dados são somente leitura.
          </Text>
        </Box>

        <CitizenAccountInfo usuario={usuario} />
      </VStack>
    </Container>
  )
}

function AccountSkeleton() {
  return (
    <Box display="flex" gap={4} alignItems="center">
      <SkeletonCircle size="16" />
      <VStack align="start" flex={1} spacing={2}>
        <Skeleton height="20px" width="160px" />
        <Skeleton height="14px" width="200px" />
        <Skeleton height="20px" width="80px" />
      </VStack>
    </Box>
  )
}

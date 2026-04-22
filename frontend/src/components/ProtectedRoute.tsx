import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Box, Spinner, VStack, Text, Button } from '@chakra-ui/react'

/**
 * ProtectedRoute HOC (Higher-Order Component)
 * 
 * Wraps a component to protect it with role-based access control
 * Redirects users without proper permissions to login or home page
 * Displays isLoading spinner while checking authentication
 * 
 * @param Component - The component to protect
 * @param requiredRole - Required user role(s) to access the component
 * @returns Protected component with auth checks
 * 
 * @example
 * export default ProtectedRoute(DashboardPage, 'cidadao')
 * export default ProtectedRoute(AdminPanel, ['admin', 'gestor'])
 */
export function ProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string | string[]
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter()
    const { usuario, isLoading } = useAuthStore()

    React.useEffect(() => {
      if (!isLoading && !usuario) {
        router.push('/login')
      }
    }, [usuario, isLoading, router])

    // Check role if specified
    if (requiredRole && usuario) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(usuario.perfil)) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
            <VStack spacing={4}>
              <Text fontSize="xl" fontWeight="bold">
                🔒 Acesso Negado
              </Text>
              <Text color="gray.600">
                Você não tem permissão para acessar esta página
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => router.push('/login')}
              >
                Voltar ao Login
              </Button>
            </VStack>
          </Box>
        )
      }
    }

    // Show isLoading
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
          <Spinner size="lg" color="primary.500" />
        </Box>
      )
    }

    // Not authenticated
    if (!usuario) {
      return null
    }

    return <Component {...props} />
  }
}


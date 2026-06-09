'use client'

import React from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Link,
} from '@chakra-ui/react'
import { useForm } from '@/hooks'
import { loginSchema } from '@/lib/validations'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    schema: loginSchema,
  })
  const { login } = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password)
      toast({
        title: 'Login realizado!',
        description: 'Redirecionando...',
        status: 'success',
        duration: 2000,
      })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Erro ao entrar',
        description: error instanceof Error ? error.message : 'Erro ao fazer login',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="md" mx="auto" py={12}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading size="2xl">Fiscalize</Heading>
          <Text color="gray.500">
            Sistema integrado de gestão urbana de Pernambuco
          </Text>
        </VStack>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
              />
              <FormErrorMessage>
                {(errors.email?.message as string)}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                placeholder="Sua senha"
                {...register('password')}
              />
              <FormErrorMessage>
                {(errors.password?.message as string)}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="primary"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Entrando..."
            >
              Entrar
            </Button>
          </VStack>
        </form>

        <Text fontSize="sm" color="gray.500">
          Não tem uma conta?{' '}
          <Link as={NextLink} href="/registro" color="primary.600" fontWeight="medium">
            Criar conta
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}

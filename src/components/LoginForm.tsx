'use client'

import React from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useForm } from '@/hooks'
import { loginSchema } from '@/lib/validations'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const DEMO_USERS = [
  { email: 'joao@example.com', nome: 'João Silva', perfil: 'Cidadão', color: 'blue' },
  { email: 'pedro@pmr.pe.gov.br', nome: 'Pedro Costa', perfil: 'Gestor', color: 'green' },
  { email: 'admin@recife.pe.gov.br', nome: 'Admin Sistema', perfil: 'Admin', color: 'purple' },
] as const

export function LoginForm() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    schema: loginSchema,
  })
  const { login } = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const onSubmit = async (data: any) => {
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

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', '123456')
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
                placeholder="qualquer senha"
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

        <Box width="100%">
          <HStack mb={3}>
            <Divider />
            <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">Usuários de teste</Text>
            <Divider />
          </HStack>
          <VStack spacing={2}>
            {DEMO_USERS.map((u) => (
              <Button
                key={u.email}
                width="100%"
                variant="outline"
                size="sm"
                onClick={() => fillDemo(u.email)}
                justifyContent="space-between"
              >
                <Text fontSize="xs" noOfLines={1}>{u.email}</Text>
                <Badge colorScheme={u.color} ml={2} flexShrink={0}>{u.perfil}</Badge>
              </Button>
            ))}
          </VStack>
          <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
            Clique para preencher automaticamente
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}


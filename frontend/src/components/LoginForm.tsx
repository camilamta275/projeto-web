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
  SimpleGrid,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Divider,
  Badge,
  Link,
} from '@chakra-ui/react'
import { useForm } from '@/hooks'
import { loginSchema } from '@/lib/validations'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

const DEMO_USERS = [
  { email: 'cidadao@fiscalize.gov.br',       label: 'Cidadão Teste', perfil: 'Cidadão', senha: 'Cidadao@123456', color: 'blue'   },
  { email: 'gestor@fiscalize.gov.br',         label: 'EMLURB',        perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'green'  },
  { email: 'gestor.compesa@fiscalize.gov.br', label: 'COMPESA',       perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'cyan'   },
  { email: 'gestor.celpe@fiscalize.gov.br',   label: 'CELPE',         perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'yellow' },
  { email: 'gestor.cttu@fiscalize.gov.br',    label: 'CTTU',          perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'orange' },
  { email: 'gestor.sinfra@fiscalize.gov.br',  label: 'SINFRA',        perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'teal'   },
  { email: 'gestor.semc@fiscalize.gov.br',    label: 'SEMC',          perfil: 'Gestor',  senha: 'Gestor@123456',  color: 'purple' },
  { email: 'admin@fiscalize.gov.br',          label: 'Admin',         perfil: 'Admin',   senha: 'Admin@123456',   color: 'red'    },
] as const

export function LoginForm() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
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

  const fillDemo = (email: string, senha: string) => {
    setValue('email', email)
    setValue('password', senha)
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
            <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">Acesso rápido</Text>
            <Divider />
          </HStack>

          {/* Cidadão */}
          {DEMO_USERS.filter(u => u.perfil === 'Cidadão').map((u) => (
            <Button
              key={u.email}
              width="100%"
              variant="outline"
              size="sm"
              colorScheme={u.color}
              onClick={() => fillDemo(u.email, u.senha)}
              justifyContent="space-between"
              mb={2}
            >
              <Text fontSize="xs">{u.label}</Text>
              <Badge colorScheme={u.color}>{u.perfil}</Badge>
            </Button>
          ))}

          {/* Gestores — grid 2 colunas */}
          <SimpleGrid columns={2} spacing={2} mb={2}>
            {DEMO_USERS.filter(u => u.perfil === 'Gestor').map((u) => (
              <Button
                key={u.email}
                variant="outline"
                size="sm"
                colorScheme={u.color}
                onClick={() => fillDemo(u.email, u.senha)}
                justifyContent="space-between"
              >
                <Text fontSize="xs" fontWeight="semibold">{u.label}</Text>
                <Badge colorScheme="green" fontSize="2xs">Gestor</Badge>
              </Button>
            ))}
          </SimpleGrid>

          {/* Admin */}
          {DEMO_USERS.filter(u => u.perfil === 'Admin').map((u) => (
            <Button
              key={u.email}
              width="100%"
              variant="outline"
              size="sm"
              colorScheme={u.color}
              onClick={() => fillDemo(u.email, u.senha)}
              justifyContent="space-between"
            >
              <Text fontSize="xs">{u.label}</Text>
              <Badge colorScheme={u.color}>{u.perfil}</Badge>
            </Button>
          ))}

          <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
            Clique para preencher automaticamente
          </Text>
        </Box>

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

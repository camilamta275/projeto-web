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
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

const signupSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não correspondem',
  path: ['confirmarSenha'],
})

type SignupFormData = z.infer<typeof signupSchema>

export function RegisterForm() {
  const router = useRouter()
  const toast = useToast()
  const { register: registerAction } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    schema: signupSchema,
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerAction(data.nome, data.email, data.senha)
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Faça login para continuar.',
        status: 'success',
        duration: 3000,
      })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="md" mx="auto">
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading size="2xl">Fiscalize</Heading>
          <Text color="gray.500">
            Sistema integrado de gestão urbana de Pernambuco
          </Text>
        </VStack>

        <VStack spacing={1} textAlign="center">
          <Heading size="md">Criar conta</Heading>
          <Text fontSize="sm" color="gray.500">Preencha os dados abaixo para se cadastrar</Text>
        </VStack>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.nome}>
              <FormLabel>Nome completo</FormLabel>
              <Input placeholder="João Silva" {...register('nome')} />
              <FormErrorMessage>{errors.nome?.message as string}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>E-mail</FormLabel>
              <Input type="email" placeholder="seu@email.com" {...register('email')} />
              <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.senha}>
              <FormLabel>Senha</FormLabel>
              <Input type="password" placeholder="Mínimo 6 caracteres" {...register('senha')} />
              <FormErrorMessage>{errors.senha?.message as string}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmarSenha}>
              <FormLabel>Confirmar senha</FormLabel>
              <Input type="password" placeholder="Repita a senha" {...register('confirmarSenha')} />
              <FormErrorMessage>{errors.confirmarSenha?.message as string}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="primary"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Criando conta..."
            >
              Criar conta
            </Button>
          </VStack>
        </form>

        <Text fontSize="sm" color="gray.500">
          Já tem uma conta?{' '}
          <Link as={NextLink} href="/login" color="primary.600" fontWeight="medium">
            Entrar
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}

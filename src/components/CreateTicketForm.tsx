'use client'

import React from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  useToast,
  FormErrorMessage,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react'
import { useForm } from '@/hooks'
import { createTicketSchema } from '@/lib/validations'
import { useTicketStore } from '@/stores/ticketStore'
import { useRouter } from 'next/navigation'
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_LABELS } from '@/utils/constants'

export function CreateTicketForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    schema: createTicketSchema,
  })
  const { createTicket } = useTicketStore()
  const router = useRouter()
  const toast = useToast()

  const onSubmit = async (data: any) => {
    try {
      await createTicket({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        location: {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          address: data.address,
        },
        reporterId: '1', // TODO: usar ID do usuário logado
        status: 'open',
        images: data.images || [],
        comments: [],
      } as any)
      
      toast({
        title: 'Sucesso',
        description: 'Ticket criado com sucesso',
        status: 'success',
        duration: 3000,
      })
      router.push('/tickets')
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar ticket',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <Box maxW="2xl">
      <VStack spacing={8}>
        <VStack spacing={2} align="start" width="100%">
          <Heading size="lg">Reportar Problema</Heading>
        </VStack>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4} width="100%">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Título do Problema</FormLabel>
              <Input
                placeholder="Ex: Buraco na Rua Ferreira Borges"
                {...register('title')}
              />
              <FormErrorMessage>{errors.title?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.category}>
              <FormLabel>Categoria</FormLabel>
              <Select placeholder="Selecione uma categoria" {...register('category')}>
                {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.category?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.priority}>
              <FormLabel>Prioridade</FormLabel>
              <Select placeholder="Selecione a prioridade" {...register('priority')}>
                {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.priority?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Descrição Detalhada</FormLabel>
              <Textarea
                placeholder="Descreva o problema em detalhes..."
                minH="120px"
                {...register('description')}
              />
              <FormErrorMessage>{errors.description?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.address}>
              <FormLabel>Endereço</FormLabel>
              <Input
                placeholder="Rua, Número, Bairro, Recife, PE"
                {...register('address')}
              />
              <FormErrorMessage>{errors.address?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={2} spacing={4} width="100%">
              <GridItem>
                <FormControl isInvalid={!!errors.latitude}>
                  <FormLabel>Latitude</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-8.047562"
                    {...register('latitude', { valueAsNumber: true })}
                  />
                  <FormErrorMessage>{errors.latitude?.message?.toString()}</FormErrorMessage>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={!!errors.longitude}>
                  <FormLabel>Longitude</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-34.877036"
                    {...register('longitude', { valueAsNumber: true })}
                  />
                  <FormErrorMessage>{errors.longitude?.message?.toString()}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </SimpleGrid>

            <Button
              type="submit"
              colorScheme="primary"
              width="100%"
              isLoading={isSubmitting}
            >
              Enviar Relatório
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}


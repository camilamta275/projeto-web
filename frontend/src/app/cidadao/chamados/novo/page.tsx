'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Progress,
  Badge,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useChamadosStore } from '@/stores/chamadosStore'
import type { CategoriaChamado } from '@/types'

const STEPS = ['Categoria', 'Detalhes', 'Confirmar']

const CATEGORIAS: {
  id: CategoriaChamado
  emoji: string
  descricao: string
  orgaoId: string
  slaHoras: number
}[] = [
  {
    id: 'Problemas na Via',
    emoji: '🛣️',
    descricao: 'Buracos, pavimentação, calçadas danificadas',
    orgaoId: '1',
    slaHoras: 48,
  },
  {
    id: 'Água e Esgoto',
    emoji: '💧',
    descricao: 'Vazamentos, falta de água, esgoto a céu aberto',
    orgaoId: '3',
    slaHoras: 36,
  },
  {
    id: 'Iluminação Pública',
    emoji: '💡',
    descricao: 'Postes apagados, fiação exposta, lâmpadas queimadas',
    orgaoId: '4',
    slaHoras: 24,
  },
  {
    id: 'Saneamento Básico',
    emoji: '🗑️',
    descricao: 'Coleta de lixo, entulho, descarte irregular',
    orgaoId: '2',
    slaHoras: 72,
  },
  {
    id: 'Sinalização',
    emoji: '🚦',
    descricao: 'Placas faltando, semáforos com defeito, faixas apagadas',
    orgaoId: '5',
    slaHoras: 48,
  },
  {
    id: 'Outros Problemas',
    emoji: '📌',
    descricao: 'Outros problemas urbanos não listados acima',
    orgaoId: '1',
    slaHoras: 48,
  },
]

export default function NovoChamadoPage() {
  const router = useRouter()
  const toast = useToast()
  const { usuario } = useAuthStore()
  const { criarChamado, loading } = useChamadosStore()

  const [step, setStep] = useState(0)
  const [categoria, setCategoria] = useState<CategoriaChamado | null>(null)
  const [descricao, setDescricao] = useState('')
  const [endereco, setEndereco] = useState('')
  const [erros, setErros] = useState<{ descricao?: string; endereco?: string }>({})

  const categoriaInfo = CATEGORIAS.find((c) => c.id === categoria)

  const validateStep1 = () => {
    if (!categoria) {
      toast({ title: 'Selecione uma categoria', status: 'warning', duration: 2500 })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const novosErros: typeof erros = {}
    if (descricao.trim().length < 20)
      novosErros.descricao = 'Descreva o problema com pelo menos 20 caracteres'
    if (endereco.trim().length < 5)
      novosErros.endereco = 'Informe o endereço completo'
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return
    if (step === 1 && !validateStep2()) return
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    const now = new Date().toISOString()
    const ano = new Date().getFullYear()
    const seq = String(Date.now()).slice(-4).padStart(4, '0')
    const protocolo = `SCH-${ano}-${seq}`

    try {
      const chamado = await criarChamado({
        protocolo,
        categoria: categoria!,
        subcategoria: '',
        descricao: descricao.trim(),
        status: 'Aberto',
        prioridade: 'Média',
        cidadaoId: usuario?.id,
        orgaoId: categoriaInfo?.orgaoId ?? '1',
        endereco: endereco.trim(),
        latitude: -8.0476,
        longitude: -34.877,
        slaHoras: categoriaInfo?.slaHoras ?? 48,
        criadoEm: now,
        atualizadoEm: now,
        timeline: [
          {
            id: String(Date.now()),
            tipo: 'criacao',
            titulo: 'Chamado aberto',
            descricao: 'Chamado registrado pelo cidadão via portal',
            autor: usuario?.nome ?? 'Cidadão',
            timestamp: now,
          },
        ],
      })

      toast({
        title: '✓ Chamado aberto com sucesso!',
        description: `Protocolo: ${chamado.protocolo ?? protocolo}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      router.push('/cidadao/chamados')
    } catch {
      toast({
        title: 'Erro ao abrir chamado',
        description: 'Verifique sua conexão e tente novamente',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <Container maxW="2xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Cabeçalho */}
        <VStack spacing={1} align="start">
          <Heading size="lg">Novo Chamado</Heading>
          <Text color="gray.500" fontSize="sm">
            Relate um problema urbano em Pernambuco — Etapa {step + 1} de {STEPS.length}
          </Text>
        </VStack>

        {/* Barra de progresso */}
        <Box>
          <HStack mb={2} justify="space-between">
            {STEPS.map((s, i) => (
              <Text
                key={s}
                fontSize="xs"
                fontWeight={i === step ? 'bold' : 'normal'}
                color={i < step ? 'green.500' : i === step ? 'blue.600' : 'gray.400'}
              >
                {i < step ? `✓ ${s}` : s}
              </Text>
            ))}
          </HStack>
          <Progress
            value={((step + 1) / STEPS.length) * 100}
            colorScheme="blue"
            borderRadius="full"
            size="sm"
          />
        </Box>

        {/* Etapa 1 — Categoria */}
        {step === 0 && (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">Qual tipo de problema você quer reportar?</Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              {CATEGORIAS.map((cat) => (
                <Card
                  key={cat.id}
                  cursor="pointer"
                  onClick={() => setCategoria(cat.id)}
                  borderWidth="2px"
                  borderColor={categoria === cat.id ? 'blue.500' : 'gray.200'}
                  bg={categoria === cat.id ? 'blue.50' : 'white'}
                  _hover={{ borderColor: 'blue.300', boxShadow: 'md' }}
                  transition="all 0.15s"
                >
                  <CardBody py={4} px={4}>
                    <HStack spacing={3}>
                      <Text fontSize="2xl">{cat.emoji}</Text>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {cat.id}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {cat.descricao}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {/* Etapa 2 — Detalhes */}
        {step === 1 && (
          <VStack spacing={5} align="stretch">
            <Badge
              colorScheme="blue"
              alignSelf="start"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {categoriaInfo?.emoji} {categoria}
            </Badge>

            <FormControl isInvalid={!!erros.descricao}>
              <FormLabel>Descrição do Problema</FormLabel>
              <Textarea
                placeholder="Descreva o problema detalhadamente. Ex: Há um buraco grande que ocupa metade da faixa da direita desde segunda-feira, causando risco aos motoristas..."
                minH="140px"
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value)
                  if (erros.descricao && e.target.value.trim().length >= 20)
                    setErros((prev) => ({ ...prev, descricao: undefined }))
                }}
              />
              <HStack justify="space-between" mt={1}>
                <FormErrorMessage m={0}>{erros.descricao}</FormErrorMessage>
                <Text
                  fontSize="xs"
                  color={descricao.trim().length >= 20 ? 'green.500' : 'gray.400'}
                  ml="auto"
                >
                  {descricao.trim().length} / 20 mínimo
                </Text>
              </HStack>
            </FormControl>

            <FormControl isInvalid={!!erros.endereco}>
              <FormLabel>Endereço / Localização</FormLabel>
              <Input
                placeholder="Ex: Rua dos Palmares, 123, Boa Vista, Recife - PE"
                value={endereco}
                onChange={(e) => {
                  setEndereco(e.target.value)
                  if (erros.endereco && e.target.value.trim().length >= 5)
                    setErros((prev) => ({ ...prev, endereco: undefined }))
                }}
              />
              <FormErrorMessage>{erros.endereco}</FormErrorMessage>
            </FormControl>

            <Box
              bg="yellow.50"
              border="1px solid"
              borderColor="yellow.200"
              borderRadius="md"
              p={3}
            >
              <Text fontSize="xs" color="yellow.700">
                📍 Dica: informe o endereço completo com bairro e cidade para agilizar o atendimento.
              </Text>
            </Box>
          </VStack>
        )}

        {/* Etapa 3 — Confirmação */}
        {step === 2 && (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium" color="gray.600">
              Revise os dados antes de enviar:
            </Text>
            <Box borderWidth="1px" borderRadius="lg" p={5} bg="gray.50">
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Text fontSize="sm" color="gray.500" minW="110px">
                    Categoria:
                  </Text>
                  <Badge colorScheme="blue" px={2} py={0.5}>
                    {categoriaInfo?.emoji} {categoria}
                  </Badge>
                </HStack>
                <Divider />
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Descrição:
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {descricao}
                  </Text>
                </Box>
                <Divider />
                <HStack align="start">
                  <Text fontSize="sm" color="gray.500" minW="110px">
                    Endereço:
                  </Text>
                  <Text fontSize="sm">{endereco}</Text>
                </HStack>
                <Divider />
                <HStack>
                  <Text fontSize="sm" color="gray.500" minW="110px">
                    Solicitante:
                  </Text>
                  <Text fontSize="sm">{usuario?.nome}</Text>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.500" minW="110px">
                    Prazo SLA:
                  </Text>
                  <Badge colorScheme="orange">{categoriaInfo?.slaHoras}h para resposta</Badge>
                </HStack>
              </VStack>
            </Box>
            <Box
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
              borderRadius="md"
              p={3}
            >
              <Text fontSize="xs" color="blue.700">
                Ao confirmar, seu chamado será registrado e encaminhado ao órgão responsável.
                Você receberá atualizações pelo portal.
              </Text>
            </Box>
          </VStack>
        )}

        {/* Navegação */}
        <HStack justify="space-between" pt={2}>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} isDisabled={loading}>
              ← Voltar
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push('/cidadao/chamados')}>
              Cancelar
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button colorScheme="blue" onClick={handleNext}>
              Próximo →
            </Button>
          ) : (
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Enviando..."
            >
              ✓ Abrir Chamado
            </Button>
          )}
        </HStack>
      </VStack>
    </Container>
  )
}

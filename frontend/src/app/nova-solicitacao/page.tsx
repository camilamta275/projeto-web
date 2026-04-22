"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
  Flex,
} from "@chakra-ui/react"
import { useAppStore } from "../../store/useAppStore"
import type { Ticket } from "../../components/ticket-table"

interface FormData {
  title: string
  category: string
  location: string
  description: string
}

const categories = [
  "Iluminação Pública",
  "Saneamento",
  "Vias Públicas",
  "Coleta de Lixo",
  "Outros",
]

export default function NovaSolicitacaoPage() {
  const router = useRouter()
  const toast = useToast()
  const addDemanda = useAppStore((state) => state.addDemanda)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    location: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simula o tempo de resposta da API
    setTimeout(() => {
      if (addDemanda) {
        const newTicket: Ticket = {
          id: Date.now().toString(),
          protocol: `PE-${new Date().getFullYear()}-${String(
            Math.floor(Math.random() * 90000) + 10000
          ).padStart(5, "0")}`,
          date: new Date().toLocaleDateString("pt-BR"),
          category: formData.category,
          status: "open",
          location: formData.location,
          description: `${formData.title}\n\n${formData.description}`,
          slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h SLA
          hasDuplicates: false,
        }
        addDemanda(newTicket)
      }

      toast({
        title: "Solicitação enviada!",
        description: "Sua demanda foi registrada com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      })

      router.push("/minhas-demandas")
      setIsLoading(false)
    }, 1000)
  }

  const isFormValid =
    formData.title.trim() !== "" &&
    formData.category.trim() !== "" &&
    formData.location.trim() !== "" &&
    formData.description.trim() !== ""

  return (
    <Box bg="gray.50" _dark={{ bg: "gray.900" }} minH="100vh" p={{ base: 0, md: 8 }}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        maxW="2xl"
        mx="auto"
        bg="white"
        _dark={{ bg: "gray.800" }}
        p={{ base: 6, md: 8 }}
        borderRadius={{ base: "none", md: "xl" }}
        shadow={{ base: "none", md: "lg" }}
      >
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" _dark={{ color: "white" }}>
              Nova Solicitação
            </Heading>
            <Text color="gray.500" mt={1}>
              Descreva o problema para que possamos direcioná-lo corretamente.
            </Text>
          </Box>

          <FormControl isRequired>
            <FormLabel>Título</FormLabel>
            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Ex: Buraco na Rua da Aurora" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Categoria</FormLabel>
            <Select name="category" value={formData.category} onChange={handleInputChange} placeholder="Selecione uma categoria">
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Localização</FormLabel>
            <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="Endereço completo com número e bairro" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Descrição</FormLabel>
            <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Forneça detalhes sobre o problema, pontos de referência, etc." minRows={4} />
          </FormControl>

          <Flex justify={{ base: "stretch", md: "flex-end" }}>
            <Button type="submit" colorScheme="blue" size="lg" w={{ base: "full", md: "auto" }} isLoading={isLoading} isDisabled={!isFormValid || isLoading}>
              Enviar Solicitação
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  )
}

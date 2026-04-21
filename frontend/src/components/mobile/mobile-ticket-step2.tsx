"use client"

import { useState } from "react"
import { ArrowLeft, Camera, MapPin, X, Image as ImageIcon, ChevronRight, CheckCircle2 } from "lucide-react"
import { Box, Flex, Button, Card, CardBody, Textarea, FormControl, FormLabel, Text, Image, IconButton } from "@chakra-ui/react"
import { useAppStore } from "../../store/useAppStore"

interface MobileTicketStep2Props {
  onBack: () => void
  onSubmit: () => void
  category: string
}

export function MobileTicketStep2({ onBack, onSubmit, category }: MobileTicketStep2Props) {
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Connect to the store to trigger creation
  const createTicket = useAppStore((state) => state.performTicketAction)

  const handleAddImage = () => {
    // Simula adição de imagem
    const placeholderImage = `https://picsum.photos/seed/${Date.now()}/400/300`
    if (images.length < 3) {
      setImages([...images, placeholderImage])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      // Em um cenário real enviaria `description` e `images` para a API/Store via createTicket
      onSubmit()
    }, 1500)
  }

  const isFormValid = description.trim().length >= 10

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Header */}
      <Box as="header" position="sticky" top="0" zIndex="50" bg="white" _dark={{ bg: "gray.800" }} borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} px="4" py="4">
        <Flex align="center" gap="4">
          <IconButton aria-label="Voltar" variant="ghost" icon={<ArrowLeft className="h-5 w-5" />} onClick={onBack} />
          <Box>
            <Text as="h1" fontSize="lg" fontWeight="semibold" letterSpacing="tight" color="gray.900" _dark={{ color: "white" }}>Novo Registro</Text>
            <Text fontSize="sm" color="gray.500">Passo 2 de 2</Text>
          </Box>
        </Flex>
      </Box>

      {/* Progress Bar */}
      <Box h="1" bg="gray.100" _dark={{ bg: "gray.800" }}>
        <Box h="full" w="66%" bg="blue.500" transition="all 0.3s" />
      </Box>

      {/* Content */}
      <Box as="main" p="4" pb="32">
        {/* Categoria selecionada */}
        <Card mb="6" bg="blue.50" borderColor="blue.200" _dark={{ bg: "whiteAlpha.50", borderColor: "whiteAlpha.200" }}>
          <CardBody p="4">
            <Flex align="center" gap="3">
              <CheckCircle2 className="h-5 w-5" color="var(--chakra-colors-blue-500)" />
              <Box>
                <Text fontSize="xs" color="gray.500">Categoria selecionada</Text>
                <Text fontWeight="medium" color="gray.900" _dark={{ color: "white" }}>{category}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Upload de Foto */}
        <Box mb="6">
          <Text as="label" fontSize="base" fontWeight="medium" mb="1" display="block" color="gray.900" _dark={{ color: "white" }}>
            Foto do Problema
          </Text>
          <Text fontSize="sm" color="gray.500" mb="3">
            Tire uma foto ou selecione da galeria (máx. 3 fotos)
          </Text>
          
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="3">
            {/* Imagens adicionadas */}
            {images.map((img, index) => (
              <Box
                key={index}
                position="relative"
                aspectRatio="1"
                borderRadius="xl"
                overflow="hidden"
                borderWidth="2px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.700" }}
              >
                <Image
                  src={img}
                  alt={`Foto ${index + 1}`}
                  objectFit="cover"
                  w="full"
                  h="full"
                />
                <IconButton
                  aria-label="Remover imagem"
                  onClick={() => handleRemoveImage(index)}
                  position="absolute"
                  top="1.5"
                  right="1.5"
                  h="6"
                  w="6"
                  minW="6"
                  borderRadius="full"
                  colorScheme="red"
                  icon={<X className="h-3 w-3" />}
                  shadow="lg"
                />
              </Box>
            ))}
            
            {/* Botão de adicionar */}
            {images.length < 3 && (
              <Flex
                as="button"
                onClick={handleAddImage}
                aspectRatio="1"
                borderRadius="xl"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="blue.300"
                bg="blue.50"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap="2"
                transition="colors 0.2s"
                _hover={{ bg: "blue.100" }}
                _active={{ transform: "scale(0.95)" }}
                _dark={{ borderColor: "blue.700", bg: "whiteAlpha.50", _hover: { bg: "whiteAlpha.100" } }}
              >
                <Flex h="12" w="12" borderRadius="full" bg="blue.100" _dark={{ bg: "blue.900" }} align="center" justify="center">
                  <Camera className="h-6 w-6" color="var(--chakra-colors-blue-500)" />
                </Flex>
                <Text fontSize="xs" fontWeight="medium" color="blue.600" _dark={{ color: "blue.300" }}>
                  {images.length === 0 ? "Tirar Foto" : "Adicionar"}
                </Text>
              </Flex>
            )}
          </Box>
        </Box>

        {/* Descrição */}
        <FormControl mb="6" isInvalid={description.length > 0 && !isFormValid}>
          <FormLabel fontSize="base" fontWeight="medium" mb="3">
            Descrição do Problema
          </FormLabel>
          <Textarea
            placeholder="Descreva o problema com detalhes. Por exemplo: 'Buraco grande no meio da rua, próximo à padaria, causando risco para veículos e pedestres.'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minH="120px"
            fontSize="base"
            resize="none"
            bg="white"
            _dark={{ bg: "gray.800" }}
          />
          <Text
            fontSize="xs"
            mt="2"
            color={description.length >= 10 ? "gray.500" : "red.500"}
          >
            {description.length}/500 caracteres (mínimo 10)
          </Text>
        </FormControl>

        {/* Localização */}
        <Card borderColor="green.200" bg="green.50" _dark={{ borderColor: "green.800", bg: "green.900" }}>
          <CardBody p="4">
            <Flex align="start" gap="3">
              <Flex h="10" w="10" align="center" justify="center" borderRadius="full" bg="green.100" _dark={{ bg: "green.800" }} flexShrink="0">
                <MapPin className="h-5 w-5" color="var(--chakra-colors-green-600)" />
              </Flex>
              <Box flex="1">
                <Flex align="center" gap="2" mb="1">
                  <CheckCircle2 className="h-4 w-4" color="var(--chakra-colors-green-600)" />
                  <Text fontWeight="medium" color="gray.900" _dark={{ color: "white" }} fontSize="sm">
                    Localização obtida via GPS
                  </Text>
                </Flex>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  Rua da Aurora, 450 - Boa Vista
                </Text>
                <Text fontSize="xs" color="gray.500" mt="1">
                  Recife, PE • Precisão: 15m
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Box>

      {/* Footer */}
      <Box as="footer" position="fixed" bottom="0" left="0" right="0" bg="white" _dark={{ bg: "gray.800" }} borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} p="4">
        <Button
          w="full"
          h="12"
          fontSize="base"
          fontWeight="medium"
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={!isFormValid || isSubmitting}
          isLoading={isSubmitting}
          loadingText="Enviando..."
          rightIcon={!isSubmitting ? <ChevronRight className="h-5 w-5" /> : undefined}
        >
          Enviar Chamado
        </Button>
      </Box>
    </Box>
  )
}

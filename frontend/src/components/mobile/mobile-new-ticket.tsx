"use client"

import { useState } from "react"
import { ArrowLeft, CircleDot, Droplets, Lightbulb, AlertTriangle, MapPin, Eye, ChevronRight, X } from "lucide-react"
import { Box, Flex, Button, Card, CardBody, Text, IconButton } from "@chakra-ui/react"

interface MobileNewTicketProps {
  onBack: () => void
  onContinue?: () => void
  onSelectCategory?: (category: string) => void
}

type Category = "buraco" | "agua" | "luz" | null

interface DuplicateAlert {
  show: boolean
  category: Category
}

const categories = [
  {
    id: "buraco" as const,
    label: "Buraco na Via",
    icon: CircleDot,
    description: "Problemas em ruas e avenidas",
    bg: "orange.50",
    borderColor: "orange.200",
    color: "orange.600",
    iconColor: "var(--chakra-colors-orange-500)",
  },
  {
    id: "agua" as const,
    label: "Água / Saneamento",
    icon: Droplets,
    description: "Falta de água, vazamentos, esgoto",
    bg: "blue.50",
    borderColor: "blue.200",
    color: "blue.600",
    iconColor: "var(--chakra-colors-blue-500)",
  },
  {
    id: "luz" as const,
    label: "Iluminação",
    icon: Lightbulb,
    description: "Postes, lâmpadas queimadas",
    bg: "yellow.50",
    borderColor: "yellow.200",
    color: "yellow.700",
    iconColor: "var(--chakra-colors-yellow-500)",
  },
]

export function MobileNewTicket({ onBack, onContinue, onSelectCategory }: MobileNewTicketProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [duplicateAlert, setDuplicateAlert] = useState<DuplicateAlert>({
    show: false,
    category: null,
  })

  const handleCategorySelect = (categoryId: Category) => {
    setSelectedCategory(categoryId)
    
    // Simula detecção de duplicidade para "buraco"
    if (categoryId === "buraco") {
      setDuplicateAlert({
        show: true,
        category: categoryId,
      })
    } else {
      setDuplicateAlert({ show: false, category: null })
    }
  }

  const handleDismissAlert = () => {
    setDuplicateAlert({ show: false, category: null })
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Header */}
      <Box as="header" position="sticky" top="0" zIndex="50" bg="white" _dark={{ bg: "gray.800" }} borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} px="4" py="4">
        <Flex align="center" gap="4">
          <IconButton aria-label="Voltar" variant="ghost" icon={<ArrowLeft className="h-5 w-5" />} onClick={onBack} />
          <Box>
            <Text as="h1" fontSize="lg" fontWeight="semibold" color="gray.900" _dark={{ color: "white" }}>Novo Registro</Text>
            <Text fontSize="sm" color="gray.500">Passo 1 de 3</Text>
          </Box>
        </Flex>
      </Box>

      {/* Progress Bar */}
      <Box h="1" bg="gray.100" _dark={{ bg: "gray.800" }}>
        <Box h="full" w="33%" bg="blue.500" transition="all 0.3s" />
      </Box>

      {/* Content */}
      <Box as="main" p="4">
        <Box mb="6">
          <Text as="h2" fontSize="xl" fontWeight="semibold" mb="2" color="gray.900" _dark={{ color: "white" }}>Qual é o problema?</Text>
          <Text color="gray.500">
            Selecione a categoria que melhor descreve a ocorrência
          </Text>
        </Box>

        {/* Alerta de Duplicidade */}
        {duplicateAlert.show && (
          <Card mb="6" borderColor="orange.400" bg="orange.50" _dark={{ bg: "orange.900", borderColor: "orange.700" }}>
            <CardBody p="4">
              <Flex align="start" gap="3">
                <Flex h="10" w="10" align="center" justify="center" borderRadius="full" bg="orange.100" _dark={{ bg: "orange.800" }} flexShrink="0">
                  <AlertTriangle className="h-5 w-5" color="var(--chakra-colors-orange-500)" />
                </Flex>
                <Box flex="1">
                  <Text fontWeight="semibold" color="gray.900" _dark={{ color: "white" }} mb="1">
                    Chamado semelhante encontrado!
                  </Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb="3">
                    Já existe um chamado parecido nesta localização. Você pode acompanhar o chamado existente ou continuar com um novo registro.
                  </Text>
                  
                  {/* Mini Mapa */}
                  <Flex borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="gray.200" mb="3" bg="gray.100" h="24" align="center" justify="center" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
                    <Box textAlign="center">
                      <MapPin className="h-6 w-6 mx-auto mb-1" color="var(--chakra-colors-red-500)" />
                      <Text fontSize="xs" color="gray.500">
                        Rua da Aurora, 450
                      </Text>
                    </Box>
                  </Flex>

                  <Flex gap="2">
                    <Button
                      variant="outline"
                      size="sm"
                      flex="1"
                      gap="1.5"
                      borderColor="orange.300"
                      color="orange.700"
                      _dark={{ borderColor: "orange.600", color: "orange.200" }}
                      onClick={handleDismissAlert}
                    >
                      <Eye className="h-4 w-4" />
                      Ver Existente
                    </Button>
                    <Button
                      size="sm"
                      flex="1"
                      gap="1.5"
                      colorScheme="orange"
                      onClick={handleDismissAlert}
                    >
                      Continuar
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Flex>
                </Box>
                <IconButton
                  aria-label="Fechar"
                  variant="ghost"
                  size="sm"
                  h="8"
                  w="8"
                  mt="-1"
                  mr="-1"
                  icon={<X className="h-4 w-4" />}
                  onClick={handleDismissAlert}
                />
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Categorias */}
        <Box className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id

            return (
              <Box
                as="button"
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                w="full"
                borderRadius="xl"
                borderWidth="2px"
                p="4"
                textAlign="left"
                transition="all 0.2s"
                _active={{ transform: "scale(0.98)" }}
                borderColor={isSelected ? "blue.500" : "gray.200"}
                bg={isSelected ? "blue.50" : "white"}
                _dark={{ 
                  borderColor: isSelected ? "blue.400" : "gray.700", 
                  bg: isSelected ? "whiteAlpha.100" : "gray.800" 
                }}
                _hover={{ borderColor: isSelected ? "blue.500" : "blue.300" }}
                shadow={isSelected ? "sm" : "none"}
              >
                <Flex align="center" gap="4">
                  <Flex
                    h="14"
                    w="14"
                    align="center"
                    justify="center"
                    borderRadius="xl"
                    borderWidth="1px"
                    bg={category.bg}
                    borderColor={category.borderColor}
                    color={category.color}
                    _dark={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.200" }}
                  >
                    <Icon className="h-7 w-7" color={category.iconColor} />
                  </Flex>
                  <Box flex="1">
                    <Text fontWeight="semibold" color="gray.900" _dark={{ color: "white" }} mb="0.5">
                      {category.label}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {category.description}
                    </Text>
                  </Box>
                  <Flex
                    h="6"
                    w="6"
                    borderRadius="full"
                    borderWidth="2px"
                    align="center"
                    justify="center"
                    transition="colors 0.2s"
                    borderColor={isSelected ? "blue.500" : "gray.300"}
                    bg={isSelected ? "blue.500" : "transparent"}
                  >
                    {isSelected && (
                      <Box h="2.5" w="2.5" borderRadius="full" bg="white" />
                    )}
                  </Flex>
                </Flex>
              </Box>
            )
          })}
        </Box>

        {/* Outras opções */}
        <Button
          variant="ghost"
          w="full"
          mt="4"
          color="gray.500"
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Ver todas as categorias
        </Button>
      </Box>

      {/* Footer */}
      <Box as="footer" position="fixed" bottom="0" left="0" right="0" bg="white" _dark={{ bg: "gray.800" }} borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} p="4">
        <Button 
          w="full" 
          size="lg"
          colorScheme="blue"
          isDisabled={!selectedCategory}
          onClick={() => {
            if (selectedCategory) {
              const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || ""
              onSelectCategory?.(categoryLabel)
              onContinue?.()
            }
          }}
          rightIcon={<ChevronRight className="h-5 w-5" />}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  )
}

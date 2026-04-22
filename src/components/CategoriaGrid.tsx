import React from 'react'
import { SimpleGrid, Card, CardBody, VStack, HStack, Text, Checkbox } from '@chakra-ui/react'

/**
 * CategoriaGrid Component
 * 
 * Displays a grid of category cards for selection in the ticket wizard
 * Each card shows category emoji, name, description, and subcategories
 * 
 * @param categorias - Array of category objects
 * @param selected - Currently selected category ID
 * @param onSelect - Callback when a category is selected
 * @returns SimpleGrid with category cards
 * 
 * @example
 * <CategoriaGrid
 *   categorias={categoriesArray}
 *   selected="agua"
 *   onSelect={(id) => setSelectedCategory(id)}
 * />
 */
interface Categoria {
  id: string
  emoji: string
  titulo: string
  descricao: string
  subcategorias?: { id: string; nome: string }[]
}

interface CategoriaGridProps {
  categorias: Categoria[]
  selected?: string
  onSelect?: (id: string) => void
}

export const CategoriaGrid: React.FC<CategoriaGridProps> = ({
  categorias,
  selected,
  onSelect,
}) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {categorias.map((categoria) => (
        <Card
          key={categoria.id}
          cursor={onSelect ? 'pointer' : 'default'}
          onClick={() => onSelect?.(categoria.id)}
          borderWidth="2px"
          borderColor={selected === categoria.id ? 'primary.500' : 'gray.200'}
          bg={selected === categoria.id ? 'blue.50' : 'white'}
          _hover={onSelect ? { borderColor: 'primary.300', boxShadow: 'md' } : {}}
          transition="all 0.2s"
        >
          <CardBody>
            <VStack align="start" spacing={3}>
              {/* Header with checkbox */}
              <HStack width="100%">
                {onSelect && (
                  <Checkbox
                    isChecked={selected === categoria.id}
                    onChange={() => onSelect(categoria.id)}
                  />
                )}
                <Text fontSize="2xl">{categoria.emoji}</Text>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="bold">{categoria.titulo}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {categoria.descricao}
                  </Text>
                </VStack>
              </HStack>

              {/* Subcategories */}
              {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                <VStack align="start" spacing={1} width="100%" fontSize="sm">
                  <Text fontWeight="bold" fontSize="xs" color="gray.600">
                    Subcategorias:
                  </Text>
                  {categoria.subcategorias.map((sub) => (
                    <Text key={sub.id} fontSize="xs" color="gray.700" ml={2}>
                      • {sub.nome}
                    </Text>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  )
}

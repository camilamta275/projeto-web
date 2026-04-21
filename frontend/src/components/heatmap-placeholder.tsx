"use client"

import { MapPin, TrendingUp, AlertTriangle, Info } from "lucide-react"
import { 
  Box, 
  Flex, 
  Card, 
  CardHeader, 
  CardBody, 
  Text, 
  Button, 
  Heading, 
  Grid, 
  GridItem,
  Tooltip
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

export interface Hotspot {
  id: number
  x: number
  y: number
  intensity: "high" | "medium" | "low"
  count: number
  label: string
}

const intensityProps = {
  high: { bg: "red.500", boxSize: "16", opacity: 0.8 },
  medium: { bg: "yellow.500", boxSize: "12", opacity: 0.8 },
  low: { bg: "blue.500", boxSize: "8", opacity: 0.6 },
}

export function HeatmapPlaceholder() {
  // Substituindo o mock de dados pelo estado global
  const hotspots = useAppStore((state) => state.heatmapHotspots) || []

  return (
    <Card overflow="hidden" bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg">
      <CardHeader pb="2">
        <Flex align="center" justify="space-between">
          <Box>
            <Heading size="md" display="flex" alignItems="center" gap="2" letterSpacing="tight">
              <Box as="span" color="blue.500">
                <MapPin className="h-5 w-5" />
              </Box>
              Mapa de Calor
            </Heading>
            <Text fontSize="sm" color="gray.500" mt="1">
              Distribuição geográfica de chamados em Recife
            </Text>
          </Box>
          <Button variant="outline" size="sm" leftIcon={<TrendingUp className="h-4 w-4" />}>
            Ver Relatório
          </Button>
        </Flex>
      </CardHeader>
      
      <CardBody p="0">
        {/* Área do Mapa */}
        <Box 
          position="relative" 
          h="400px" 
          overflow="hidden" 
          bgGradient="linear(to-br, gray.100, gray.200, gray.300)"
          _dark={{ bgGradient: "linear(to-br, gray.800, gray.900, black)" }}
        >
          {/* Grid estilizado simulando mapa */}
          <Box as="svg" position="absolute" inset="0" h="full" w="full" opacity="0.2" color="gray.500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </Box>

          {/* Simulação de vias/rios */}
          <Box position="absolute" left="25%" top="0" h="full" w="1px" bg="blue.500" opacity="0.2" />
          <Box position="absolute" left="50%" top="0" h="full" w="1px" bg="blue.500" opacity="0.2" />
          <Box position="absolute" left="75%" top="0" h="full" w="1px" bg="blue.500" opacity="0.2" />
          <Box position="absolute" left="0" top="25%" h="1px" w="full" bg="blue.500" opacity="0.2" />
          <Box position="absolute" left="0" top="50%" h="1px" w="full" bg="blue.500" opacity="0.2" />
          <Box position="absolute" left="0" top="75%" h="1px" w="full" bg="blue.500" opacity="0.2" />
          
          {/* Curva simulando rio */}
          <Box as="svg" position="absolute" inset="0" h="full" w="full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0 50 Q 30 30, 50 45 T 100 35" fill="none" stroke="currentColor" strokeWidth="0.8" color="blue.500" opacity="0.3" />
          </Box>

          {/* Hotspots */}
          {hotspots.map((spot: Hotspot) => {
            const props = intensityProps[spot.intensity]
            return (
              <Tooltip
                key={spot.id}
                label={
                  <Box textAlign="center">
                    <Text fontWeight="semibold" fontSize="sm">{spot.label}</Text>
                    <Text fontSize="xs" color="gray.300">{spot.count} chamados</Text>
                  </Box>
                }
                placement="top"
                hasArrow
                bg="gray.900"
                _dark={{ bg: "gray.700" }}
              >
                <Box
                  position="absolute"
                  transform="translate(-50%, -50%)"
                  left={`${spot.x}%`}
                  top={`${spot.y}%`}
                  cursor="pointer"
                  role="group"
                >
                  <Box
                    bg={props.bg}
                    boxSize={props.boxSize}
                    opacity={props.opacity}
                    borderRadius="full"
                    filter="blur(4px)"
                    transition="all 0.3s"
                    _groupHover={{ opacity: 0.9, transform: "scale(1.1)" }}
                  />
                  <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)">
                    <Box h="3" w="3" borderRadius="full" bg="gray.800" _dark={{ bg: "gray.200" }} shadow="lg" />
                  </Box>
                </Box>
              </Tooltip>
            )
          })}

          {/* Legenda */}
          <Box position="absolute" bottom="4" left="4" borderRadius="lg" bg="whiteAlpha.900" _dark={{ bg: "blackAlpha.800" }} backdropFilter="blur(4px)" p="3" shadow="lg" border="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
            <Text fontSize="xs" fontWeight="medium" mb="2" color="gray.900" _dark={{ color: "white" }}>Legenda</Text>
            <Flex direction="column" gap="1.5">
              <Flex align="center" gap="2">
                <Box h="3" w="3" borderRadius="full" bg="red.500" opacity="0.8" />
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>Alta incidência</Text>
              </Flex>
              <Flex align="center" gap="2">
                <Box h="3" w="3" borderRadius="full" bg="yellow.500" opacity="0.8" />
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>Média incidência</Text>
              </Flex>
              <Flex align="center" gap="2">
                <Box h="3" w="3" borderRadius="full" bg="blue.500" opacity="0.6" />
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>Baixa incidência</Text>
              </Flex>
            </Flex>
          </Box>

          {/* Aviso de placeholder */}
          <Flex position="absolute" top="4" right="4" align="center" gap="2" borderRadius="lg" bg="whiteAlpha.900" _dark={{ bg: "blackAlpha.800" }} backdropFilter="blur(4px)" px="3" py="2" shadow="lg" border="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
            <Info className="h-4 w-4 text-muted-foreground" />
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>Visualização simulada</Text>
          </Flex>
        </Box>

        {/* Estatísticas rápidas */}
        <Grid templateColumns="repeat(3, 1fr)" borderTop="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} bg="gray.50" _dark={{ bg: "whiteAlpha.50" }}>
          <GridItem p="4" textAlign="center" borderRight="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
            <Flex align="center" justify="center" gap="1.5" color="red.500">
              <AlertTriangle className="h-4 w-4" />
              <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">85</Text>
            </Flex>
            <Text fontSize="xs" color="gray.500" mt="1">Zonas críticas</Text>
          </GridItem>
          <GridItem p="4" textAlign="center" borderRight="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="gray.900" _dark={{ color: "white" }}>12</Text>
            <Text fontSize="xs" color="gray.500" mt="1">Bairros afetados</Text>
          </GridItem>
          <GridItem p="4" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="green.500">23%</Text>
            <Text fontSize="xs" color="gray.500" mt="1">Redução vs. mês anterior</Text>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}

"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Box, Flex, Text, Select, Button, IconButton } from "@chakra-ui/react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push("...")
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  return (
    <Box 
      className="flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      borderTop="1px"
      borderColor="gray.200"
      bg="white"
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
    >
      {/* Info */}
      <Flex className="flex items-center gap-4 text-sm" color="gray.500">
        <Text>
          Mostrando <Text as="span" fontWeight="medium" color="gray.900" _dark={{ color: "white" }}>{startItem}</Text> a{" "}
          <Text as="span" fontWeight="medium" color="gray.900" _dark={{ color: "white" }}>{endItem}</Text> de{" "}
          <Text as="span" fontWeight="medium" color="gray.900" _dark={{ color: "white" }}>{totalItems}</Text> resultados
        </Text>
        <Flex align="center" gap="2">
          <Text>Exibir</Text>
          <Select
            value={itemsPerPage.toString()}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            size="sm"
            width="75px"
            borderRadius="md"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </Flex>
      </Flex>

      {/* Navigation */}
      <Flex align="center" gap="1">
        <IconButton
          aria-label="Primeira página"
          variant="outline"
          size="sm"
          icon={<ChevronsLeft className="h-4 w-4" />}
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
        />
        <IconButton
          aria-label="Página anterior"
          variant="outline"
          size="sm"
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        />

        <Flex align="center" gap="1" mx="2">
          {getVisiblePages().map((page, index) => (
            <Box key={index}>
              {page === "..." ? (
                <Box px="2" color="gray.500">...</Box>
              ) : (
                <Button
                  variant={currentPage === page ? "solid" : "ghost"}
                  colorScheme={currentPage === page ? "blue" : "gray"}
                  size="sm"
                  width="8"
                  px="0"
                  pointerEvents={currentPage === page ? "none" : "auto"}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </Box>
          ))}
        </Flex>

        <IconButton
          aria-label="Próxima página"
          variant="outline"
          size="sm"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        />
        <IconButton
          aria-label="Última página"
          variant="outline"
          size="sm"
          icon={<ChevronsRight className="h-4 w-4" />}
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
        />
      </Flex>
    </Box>
  )
}

import React from 'react'
import { Box, HStack, Text, Progress } from '@chakra-ui/react'

/**
 * SLABar Component
 * 
 * Displays a visual SLA progress bar with dynamic coloring based on remaining time
 * Color scheme: Green (on track) → Orange (warning) → Red (critical/expired)
 * 
 * @param slaRestante - Hours remaining in SLA (negative values indicate expired)
 * @param slaTotal - Total SLA hours for percentage calculation
 * @returns Box with progress bar and status text
 * 
 * @example
 * <SLABar slaRestante={12} slaTotal={48} />
 * <SLABar slaRestante={-3} slaTotal={48} /> // Expired
 */
interface SLABarProps {
  slaRestante: number
  slaTotal: number
  showLabel?: boolean
}

export const SLABar: React.FC<SLABarProps> = ({ 
  slaRestante, 
  slaTotal, 
  showLabel = true 
}) => {
  // Calculate percentage
  const percentage = Math.max(0, (slaRestante / slaTotal) * 100)
  
  // Determine color based on remaining time
  let colorScheme: string
  let bgColor: string
  
  if (slaRestante < 0) {
    colorScheme = 'red'
    bgColor = 'red.100'
  } else if (slaRestante < slaTotal * 0.25) {
    colorScheme = 'orange'
    bgColor = 'orange.100'
  } else {
    colorScheme = 'green'
    bgColor = 'green.100'
  }

  return (
    <Box>
      <Progress 
        value={percentage} 
        colorScheme={colorScheme}
        size="lg"
        borderRadius="full"
        bg={bgColor}
      />
      {showLabel && (
        <HStack spacing={2} mt={2} fontSize="sm">
          <Text fontWeight="bold" color={colorScheme === 'red' ? 'red.600' : colorScheme === 'orange' ? 'orange.600' : 'green.600'}>
            {slaRestante < 0 ? `❌ Vencido há ${Math.abs(slaRestante)}h` : `✓ ${slaRestante}h restantes`}
          </Text>
          <Text color="gray.600">
            ({Math.round(percentage)}%)
          </Text>
        </HStack>
      )}
    </Box>
  )
}

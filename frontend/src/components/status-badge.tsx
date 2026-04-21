import { Badge } from "@chakra-ui/react"

export type TicketStatus = "open" | "progress" | "completed" | "critical"

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
}

const statusConfig: Record<TicketStatus, { label: string; colorScheme: string }> = {
  open: {
    label: "Aberto",
    colorScheme: "blue",
  },
  progress: {
    label: "Em Execução",
    colorScheme: "orange",
  },
  completed: {
    label: "Concluído",
    colorScheme: "green",
  },
  critical: {
    label: "Crítico",
    colorScheme: "red",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      colorScheme={config.colorScheme}
      className={className}
      borderRadius="full"
      px="2.5"
      py="0.5"
      textTransform="none"
      fontSize="xs"
      fontWeight="medium"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      {config.label}
    </Badge>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Flex, Text } from "@chakra-ui/react"
import { Clock } from "lucide-react"

interface SLATimerProps {
  deadline: Date | string
  className?: string
}

export function SLATimer({ deadline, className }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isOverdue, setIsOverdue] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const targetDate = deadline instanceof Date ? deadline : new Date(deadline)
      const diff = targetDate.getTime() - now.getTime()

      if (diff <= 0) {
        setIsOverdue(true)
        const absDiff = Math.abs(diff)
        const hours = Math.floor(absDiff / (1000 * 60 * 60))
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`-${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
      } else {
        setIsOverdue(false)
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        )
        setIsUrgent(hours < 2)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  let bg = "gray.100"
  let color = "gray.500"
  let darkBg = "gray.700"
  let darkColor = "gray.400"

  if (isOverdue) {
    bg = "red.50"
    color = "red.500"
    darkBg = "red.900"
    darkColor = "red.300"
  } else if (isUrgent) {
    bg = "orange.50"
    color = "orange.600"
    darkBg = "orange.900"
    darkColor = "orange.300"
  }

  return (
    <Flex
      display="inline-flex"
      align="center"
      gap="1.5"
      borderRadius="md"
      px="2"
      py="1"
      fontSize="xs"
      fontFamily="mono"
      fontWeight="medium"
      bg={bg}
      color={color}
      _dark={{ bg: darkBg, color: darkColor }}
      className={className}
    >
      <Clock className="h-3 w-3" />
      <Text as="span">{timeLeft}</Text>
    </Flex>
  )
}

'use client'

import React from 'react'
import { Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'

interface KPICardProps {
  label: string
  value: string | number
  helpText?: string
  trend?: 'up' | 'down'
}

export function KPICard({ label, value, helpText }: KPICardProps) {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  )
}

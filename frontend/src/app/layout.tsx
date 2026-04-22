import type { Metadata } from 'next'
import React from 'react'
import { Providers } from '@/components'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Fiscalize - Sistema de Gestão Urbana',
  description: 'Sistema integrado de gestão urbana de Pernambuco - Recife Inteligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

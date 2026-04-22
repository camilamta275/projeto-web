# Guia de Desenvolvimento - Fiscalize

## 🎯 Começar um Novo Feature

### 1. Criar um novo componente
```typescript
'use client'

import React from 'react'
import { Box, Heading } from '@chakra-ui/react'

interface MyComponentProps {
  title: string
  children?: React.ReactNode
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <Box p={4}>
      <Heading>{title}</Heading>
      {children}
    </Box>
  )
}
```

### 2. Usar Zustand Store
```typescript
'use client'

import { useTicketStore } from '@/stores/ticketStore'

export function MyPage() {
  const { tickets, fetchTickets } = useTicketStore()

  React.useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  )
}
```

### 3. Usar React Hook Form com Zod
```typescript
'use client'

import { useForm } from '@/hooks'
import { createTicketSchema } from '@/lib/validations'

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    schema: createTicketSchema,
  })

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

### 4. Fazer chamadas à API
```typescript
import { useApi } from '@/hooks'

export function MyComponent() {
  const { data, isLoading, error, execute } = useApi('/api/tickets')

  return (
    <button onClick={execute}>
      {isLoading ? 'Carregando...' : 'Carregar Tickets'}
    </button>
  )
}
```

## 📋 Padrões de Código

### Type Safety
Sempre use TypeScript strict mode. Defina tipos para props e estados:

```typescript
interface MyProps {
  title: string
  count: number
  onChanged: (value: string) => void
}

export function MyComponent({ title, count, onChanged }: MyProps) {
  // ...
}
```

### Componentes Client-side
Use `'use client'` no topo de componentes que usam hooks ou eventos:

```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  // ...
}
```

### Validação com Zod
Sempre valide dados do formulário:

```typescript
export const mySchema = z.object({
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Deve ter 18 ou mais'),
})
```

## 🔌 Adicionar nova Rota da API

1. Crie um arquivo em `src/app/api/[feature]/route.ts`
2. Implemente GET, POST, etc:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: [] }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  return NextResponse.json(data, { status: 201 })
}
```

## 🎨 Customizar Tema

Edite `src/lib/theme.ts`:

```typescript
const theme = extendTheme({
  colors: {
    myColor: '#FF0000',
  },
})
```

Depois use:
```typescript
<Box color="myColor">Texto</Box>
```

## 📝 Adicionar Validação Zod

Em `src/lib/validations.ts`:

```typescript
export const mySchema = z.object({
  field: z.string().min(1),
})

export type MyFormData = z.infer<typeof mySchema>
```

## 🔄 Workflow Recomendado

1. ✅ Defina os tipos em `src/types/index.ts`
2. ✅ Crie validações em `src/lib/validations.ts`
3. ✅ Crie componentes em `src/components/`
4. ✅ Crie a página em `src/app/`
5. ✅ Implemente a API route se necessário
6. ✅ Adicione testes

## 🚀 Deploy

### Vercel (recomendado)
```bash
vercel
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Chakra UI Docs](https://chakra-ui.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)

# 🚀 Quick Start - Fiscalize

Comece a desenvolver em 5 minutos!

## ⚡ Setup Inicial

### 1. Instale as Dependências
```bash
npm install
# ou
yarn install
# ou
bun install
```

### 2. Configure Variáveis de Ambiente
Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite `.env.local` se necessário.

### 3. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Credenciais de Teste

**Email**: cidadao@example.com  
**Senha**: qualquer uma (simulado com MSW)

## 🎯 Primeiro Passos

### Explorar a Aplicação
1. Acesse a página inicial
2. Clique em "Entrar" (use credenciais de teste)
3. Veja o dashboard
4. Explore a seção de tickets

### Criar um Novo Ticket
1. Vá em "Novo Ticket"
2. Preencha o formulário
3. Clique em "Enviar Relatório"

### Ver Detalhes de um Ticket
1. Vá em "Tickets"
2. Clique em "Ver Detalhes" em um ticket
3. Adicione comentários

## 📁 Onde Encontrar Tudo

| O Que | Onde |
|------|------|
| Componentes | `src/components/` |
| Páginas | `src/app/` |
| State Management | `src/stores/` |
| Tipos TypeScript | `src/types/` |
| Validações Zod | `src/lib/validations.ts` |
| API Routes | `src/app/api/` |
| Hooks Customizados | `src/hooks/` |
| Constantes | `src/utils/constants.ts` |

## 🔨 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev

# Build e Deploy
npm run build           # Build para produção
npm run start           # Inicia produção

# Qualidade de Código
npm run lint            # Verifica com ESLint
npm run format          # Formata com Prettier
npm run type-check      # Verifica tipos TypeScript

# Testes
npm run test            # Roda testes
```

## 🛠️ Estrutura de uma Nova Feature

Vamos criar um novo componente de exemplo:

### 1. Criar o Componente
```typescript
// src/components/MyComponent.tsx
'use client'

import { Box, Heading } from '@chakra-ui/react'

export function MyComponent() {
  return (
    <Box p={4}>
      <Heading>Meu Componente</Heading>
    </Box>
  )
}
```

### 2. Usar em uma Página
```typescript
// src/app/my-feature/page.tsx
'use client'

import { MainLayout } from '@/components'
import { MyComponent } from '@/components/MyComponent'

export default function MyFeaturePage() {
  return (
    <MainLayout>
      <MyComponent />
    </MainLayout>
  )
}
```

### 3. Adicionar ao Índice de Componentes
```typescript
// src/components/index.ts
export { MyComponent } from './MyComponent'
```

## 📊 Struktur Rápida de um Store Zustand

```typescript
import { create } from 'zustand'

interface MyState {
  count: number
  increment: () => void
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

Usar em componente:
```typescript
import { useMyStore } from '@/stores/myStore'

export function MyComponent() {
  const { count, increment } = useMyStore()
  
  return <button onClick={increment}>Clique: {count}</button>
}
```

## ✅ Checklist de Configuração

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` configurado
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Aberto em `http://localhost:3000`
- [ ] Conseguiu fazer login

## 🆘 Problemas Comuns

### Porta 3000 já está em uso
```bash
# Use outra porta
PORT=3001 npm run dev
```

### Erro de tipos TypeScript
```bash
npm run type-check
```

### ESLint erros
```bash
npm run lint --fix
```

### Prettier formatação
```bash
npm run format
```

## 📚 Documentação Completa

- [README.md](./README.md) - Visão geral do projeto
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia detalhado de desenvolvimento
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura das pastas
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir

## 🚀 Próximos Passos

1. ✅ Setup e teste da aplicação
2. 📖 Ler a documentação em [DEVELOPMENT.md](./DEVELOPMENT.md)
3. 💻 Criar seu primeiro componente
4. 📝 Adicionar validações com Zod
5. 🔄 Usar Zustand para state management

---

**Dúvidas?** Veja a documentação completa ou abra uma issue! 🎉

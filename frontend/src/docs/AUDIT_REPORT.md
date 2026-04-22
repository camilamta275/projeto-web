# 📋 AUDITORIA TÉCNICA - PROJETO SMART CITY FISCALIZE

**Data:** 22 de Abril de 2026  
**Escopo:** Análise rigorosa conforme 5 pilares técnicos  
**Status:** ⚠️ **MÚLTIPLAS NÃO-CONFORMIDADES IDENTIFICADAS**

---

## 🎯 RESUMO EXECUTIVO

O projeto apresenta **problemas críticos e médios** em qualidade de TypeScript, organização arquitetural e consistência de estilo. Recomenda-se ação corretiva antes de produção.

- ❌ **Críticos:** 4 problemas
- ⚠️ **Médios:** 12 problemas  
- ℹ️ **Menores:** 8 problemas

---

## 1️⃣ ESTRUTURA, ORGANIZAÇÃO E NEXT.JS

### 1.1 ❌ CRÍTICO: Nomenclatura Inconsistente de Componentes

**Problema:** Componentes não seguem padrão de nomenclatura consistente
- `HeaderCidadao.tsx` vs `NotificationBell.tsx` vs `ChamadoCard.tsx`
- Mistura de padrões: PascalCase correto, mas sem padronização de sufixo
- Arquivo `notificacoesStore.ts` vs `ticketStore.ts` (português vs inglês)

**Arquivos Afetados:**
- [src/components/HeaderCidadao.tsx](src/components/HeaderCidadao.tsx)
- [src/components/NotificationBell.tsx](src/components/NotificationBell.tsx)
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts)
- [src/stores/ticketStore.ts](src/stores/ticketStore.ts)
- [src/stores/managerProfileStore.ts](src/stores/managerProfileStore.ts)

**Impacto:** Dificulta manutenção, padronização e escalabilidade

---

### 1.2 ⚠️ MÉDIO: Importações Duplicadas em index.ts

**Problema:** Arquivo `src/components/index.ts` foi revertido e não exporta os novos componentes criados
```typescript
// ❌ index.ts não contém:
// export { BackButton } from './BackButton'
// export { NotificationDropdown } from './NotificationDropdown'
// export { CidadaoHeader } from './CidadaoHeader'
```

**Arquivo Afetado:**
- [src/components/index.ts](src/components/index.ts)

**Impacto:** Dificulta importações padronizadas

---

### 1.3 ⚠️ MÉDIO: Múltiplas Stores com Mesmo Propósito

**Problema:** Existem 2 stores para notificações:
- `notificacoesStore.ts` (português)
- `notificationStore.ts` (inglês - adicionado)

Ambas tentam fazer o mesmo com interfaces ligeiramente diferentes.

**Arquivos Afetados:**
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts)
- [src/stores/notificationStore.ts](src/stores/notificationStore.ts)

**Impacto:** Confusão, estado duplicado, manutenção duplicada

---

### 1.4 ℹ️ MENOR: Falta de Arquivo .env.local ou .env.example

**Problema:** Não há definição clara de variáveis de ambiente necessárias
- URLs hardcoded em vários serviços: `http://localhost:3001`
- Sem exemplos de configuração para devs

**Arquivos Afetados:**
- [src/services/api.ts](src/services/api.ts)
- [src/stores/chamadosStore.ts](src/stores/chamadosStore.ts)
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts)

---

## 2️⃣ QUALIDADE DO TYPESCRIPT

### 2.1 ❌ CRÍTICO: Uso Excessivo de `any`

**Problema:** 16+ instâncias de `any` em todo o projeto

**Occorrências Específicas:**

1. **API Routes:**
   ```typescript
   // ❌ src/app/api/notifications/route.ts - linha 3
   const mockNotifications: any[] = []
   
   // ❌ src/app/api/tickets/[id]/route.ts - linha 4
   const mockTickets: any = { ... }
   
   // ❌ src/app/api/users/[id]/route.ts - linha 3
   const mockUsers: any = { ... }
   ```

2. **Componentes:**
   ```typescript
   // ❌ src/components/ChamadoCard.tsx - linha 76-77
   <StatusBadge status={chamado.status as any} />
   <PriorityBadge priority={chamado.prioridade as any} />
   
   // ❌ src/components/FilaChamadoRow.tsx - linha 73, 76
   <PriorityBadge priority={chamado.prioridade as any} />
   <StatusBadge status={chamado.status as any} />
   
   // ❌ src/components/CreateTicketForm.tsx - linha 33
   const onSubmit = async (data: any) => {
   
   // ❌ src/components/CreateTicketForm.tsx - linha 49
   } as any)
   ```

3. **Admin Pages:**
   ```typescript
   // ❌ src/app/admin/usuarios/page.tsx - linha 382
   onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
   ```

4. **Gestor Pages:**
   ```typescript
   // ❌ src/app/gestor/perfil/page.tsx - linha 46, 61
   } catch (error: any) {
   
   // ❌ src/app/gestor/fila/page.tsx - linha 294, 297
   <PriorityBadge priority={chamado.prioridade as any} />
   <StatusBadge status={chamado.status as any} />
   ```

5. **Services:**
   ```typescript
   // ❌ src/services/chamados.ts - linha 5
   listar: async (filtros?: Record<string, any>) => {
   
   // ❌ src/components/LoginForm.tsx - linha 38
   const onSubmit = async (data: any) => {
   ```

**Impacto:** 
- ❌ Perde type-safety
- ❌ Impossível detectar erros em tempo de compilação
- ❌ Dificulta refatoração
- ❌ Viola política de zero `any`

---

### 2.2 ⚠️ MÉDIO: Tipos Inconsistentes em Interfaces de Props

**Problema:** Props de componentes usam types genéricos ou estão misturadas com tipos inline

**Exemplo:**
```typescript
// ❌ src/components/ChamadoCard.tsx
interface Chamado {  // Tipo específico do componente, não reutiliza tipo global
  id: string
  protocolo: string
  // ... campos duplicados ...
}

// ✅ Deveria importar type do sistema central
import type { Chamado } from '@/types'
```

**Arquivos Afetados:**
- [src/components/ChamadoCard.tsx](src/components/ChamadoCard.tsx)
- [src/app/admin/usuarios/page.tsx](src/app/admin/usuarios/page.tsx) (define `interface Usuario` local)

---

### 2.3 ⚠️ MÉDIO: Type Casting Desnecessário

**Problema:** Casts `as any` usados para contornar problemas de tipo ao invés de resolver
```typescript
// ❌ Errado
<StatusBadge status={chamado.status as any} />

// ✅ Correto seria tipificar corretamente
<StatusBadge status={chamado.status as StatusChamado} />
```

**Arquivos Afetados:**
- [src/components/ChamadoCard.tsx](src/components/ChamadoCard.tsx#L76-L77)
- [src/components/FilaChamadoRow.tsx](src/components/FilaChamadoRow.tsx#L73-L76)
- [src/app/gestor/fila/page.tsx](src/app/gestor/fila/page.tsx#L294-L297)
- [src/app/gestor/chamados/[id]/page.tsx](src/app/gestor/chamados/[id]/page.tsx#L198-L199)

---

### 2.4 ℹ️ MENOR: Erro Handling Genérico

**Problema:** Tipos de erro capturados genericamente sem diferenciação
```typescript
// ❌ src/app/gestor/perfil/page.tsx - linha 46, 61
catch (error: any) {
  showToast(error, 'error')
}

// ✅ Correto seria
catch (error) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido'
  showToast(message, 'error')
}
```

---

## 3️⃣ COMPONENTIZAÇÃO E UI/UX (CHAKRA UI + TAILWIND)

### 3.1 ❌ CRÍTICO: Mistura Caótica de Chakra UI e Tailwind CSS

**Problema:** Componentes misturam estilos Chakra UI com classes Tailwind CSS, criando conflitos

**Evidência em HeaderCidadao.tsx:**
```typescript
// ❌ Mistura de padrões
<header className="flex items-center justify-between w-full px-6 py-4 bg-white shadow-sm">
  {/* Misturado com Chakra */}
  <Button 
    variant="ghost"
    className="hover:bg-gray-100 transition-colors"  // ← Tailwind aqui
  >
    Voltar para o Login
  </Button>

  <Menu>
    <MenuButton
      as={IconButton}
      className="hover:bg-gray-100 rounded-full transition-colors"  // ← Tailwind aqui também
    />
  </Menu>

  <MenuItem
    className={`rounded-md mb-1 transition-colors ${...}`}  // ← Tailwind em MenuItem
  />
</header>

// ✅ Deveria ser apenas Chakra:
<Box as="header" display="flex" justifyContent="space-between" w="full" px={6} py={4} bg="white" boxShadow="sm">
  <Button variant="ghost" _hover={{ bg: 'gray.100' }} transition="colors 0.2s">
    Voltar para o Login
  </Button>
  {/* ... */}
</Box>
```

**Arquivo Afetado:**
- [src/components/HeaderCidadao.tsx](src/components/HeaderCidadao.tsx) (linhas 37, 41, 58, 81-130)

**Instâncias:**
- Linha 37: `className="flex items-center justify-between w-full px-6 py-4 bg-white shadow-sm"`
- Linha 41: `className="hover:bg-gray-100 transition-colors"`
- Linha 58: `className="hover:bg-gray-100 rounded-full transition-colors"`
- Linha 81: `className="shadow-lg rounded-md"`
- Linha 82: `className="px-4 py-2 text-gray-700"`
- Linha 88: `className="flex justify-center p-4"`
- Linha 94: `className="p-4 text-sm text-gray-500 text-center"`
- Linha 103-104: `className={`rounded-md mb-1 transition-colors ...}`
- Linha 110: `className="text-gray-800"`
- Linha 117: `className="text-gray-600 line-clamp-2"`
- Linha 120: `className="text-gray-400 mt-1"`
- Linha 130: `className="justify-center text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium"`

**Impacto:**
- ❌ Conflitos de estilos imprevisíveis
- ❌ Tailwind pode sobrescrever Chakra
- ❌ Impossível manter consistência visual
- ❌ Performance degradada (duplicação de CSS)

---

### 3.2 ⚠️ MÉDIO: Mesmo Padrão em Outros Componentes

**Problema:** Padrão de mistura Tailwind + Chakra também aparece em:
```typescript
// src/app/gestor/perfil/page.tsx - usa className extensivamente
<Box className="page">
<Box className="header" as="header">
<Box className="glass-card profile profile-card animate-fade-in" as="section">
<Box className="avatar">
<Text className="profile-name">
```

**Arquivo Afetado:**
- [src/app/gestor/perfil/page.tsx](src/app/gestor/perfil/page.tsx) (linhas 68-181+)

---

### 3.3 ⚠️ MÉDIO: Falta de Estados de Loading/Error Consistentes

**Problema:** Componentes não tratam estados de forma consistente

**Exemplo - HeaderCidadao não trata erro:**
```typescript
// src/components/HeaderCidadao.tsx
const { notificacoes, loading, marcarComoLida } = useNotificacoesStore()
// ⚠️ Não há `erro` na store para tratar falhas

// Mas store base notificacoesStore tem apenas console.error
fetchNotificacoes: async (usuarioId: string) => {
  try {
    const response = await fetch(...)
    // ...
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)  // ← Apenas log, sem estado
  }
}
```

**Impacto:**
- ❌ Usuário não recebe feedback de erro
- ❌ Requisição falha silenciosamente

---

### 3.4 ℹ️ MENOR: Falta de Feedback Visual em Operações

**Problema:** Não há spinner/toast em algumas operações assíncronas
```typescript
// src/components/HeaderCidadao.tsx - linha 29
const handleNotificacaoClick = async (id: string, chamadoId?: string) => {
  await marcarComoLida(id)  // ← Sem feedback visual enquanto executa
  if (chamadoId) {
    router.push(`/cidadao/chamados/${chamadoId}`)
  }
}
```

---

## 4️⃣ GERENCIAMENTO DE ESTADO (ZUSTAND) E API

### 4.1 ⚠️ MÉDIO: Store de Notificações Sem Estados de Loading/Error

**Problema:** `notificacoesStore.ts` não gerencia estado de loading ou erro

```typescript
// ❌ src/stores/notificacoesStore.ts
interface NotificacoesState {
  notificacoes: Notificacao[]
  naoLidas: number
  fetchNotificacoes: (usuarioId: string) => Promise<void>
  // ❌ Faltam:
  // loading: boolean
  // erro: string | null
}

fetchNotificacoes: async (usuarioId: string) => {
  try {
    // ...
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)  // ← Apenas log, sem propagação
  }
}
```

**Arquivo Afetado:**
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts)

**Impacto:**
- ❌ Impossível saber se falhou ou está carregando
- ❌ Componentes não podem exibir erro ao usuário

---

### 4.2 ⚠️ MÉDIO: Chamadas de API Hardcoded em Múltiplos Locais

**Problema:** URL da API replicada em vários arquivos
```typescript
// ❌ Repetido em:
'http://localhost:3001/notificacoes?usuarioId=${usuarioId}'  // notificacoesStore
'http://localhost:3001/chamados'  // chamadosStore
'http://localhost:3001/usuarios?email=...'  // authStore
```

**Deveria ser:** Centralizado em `src/services/api.ts`

**Arquivo Afetado:**
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts#L30-L36)
- [src/stores/chamadosStore.ts](src/stores/chamadosStore.ts#L32)
- [src/stores/authStore.ts](src/stores/authStore.ts#L50)

---

### 4.3 ⚠️ MÉDIO: Falta de Separação entre Lógica e API

**Problema:** Stores fazem fetch diretamente ao invés de usar serviços

```typescript
// ❌ Errado - lógica de API dentro da store
fetchNotificacoes: async (usuarioId: string) => {
  const response = await fetch(`http://localhost:3001/notificacoes?...`)
  const notificacoes = await response.json()
  set({ notificacoes })
}

// ✅ Correto - usar serviço
import { fetchNotificacoes } from '@/services/notificationsService'
fetchNotificacoes: async (usuarioId: string) => {
  const data = await fetchNotificacoes({ usuarioId })
  set({ notificacoes: data })
}
```

**Arquivo Afetado:**
- [src/stores/notificacoesStore.ts](src/stores/notificacoesStore.ts)

---

### 4.4 ℹ️ MENOR: Tipo genérico Record<string, any> em serviços

**Problema:** Filtros não tipificados
```typescript
// ❌ src/services/chamados.ts - linha 5
listar: async (filtros?: Record<string, any>) => {

// ✅ Deveria ser:
interface ChamadosFiltros {
  status?: StatusChamado
  orgao?: string
  busca?: string
}
listar: async (filtros?: ChamadosFiltros) => {
```

---

## 5️⃣ FORMULÁRIOS

### 5.1 ⚠️ MÉDIO: Validações Desconexas da UI

**Problema:** Validação com Zod definida, mas nem sempre usada

```typescript
// ✅ Validação definida em src/lib/validations.ts
export const createTicketSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  // ...
})

// ❌ Mas componentes usam `any` no handler
const onSubmit = async (data: any) => {  // ← Perde type-safety
  // ...
}
```

**Arquivos Afetados:**
- [src/components/CreateTicketForm.tsx](src/components/CreateTicketForm.tsx#L33)
- [src/components/LoginForm.tsx](src/components/LoginForm.tsx#L38)

---

### 5.2 ⚠️ MÉDIO: Falta de Validação em Alguns Formulários

**Problema:** Admin usuario page não tem schema de validação

```typescript
// ❌ src/app/admin/usuarios/page.tsx
const [formData, setFormData] = useState<Usuario>({ ... })
// Sem validação ao submeter

// Deveria ter:
const { register, handleSubmit, formState: { errors } } = useForm({
  schema: usuarioValidationSchema
})
```

**Arquivo Afetado:**
- [src/app/admin/usuarios/page.tsx](src/app/admin/usuarios/page.tsx)

---

### 5.3 ℹ️ MENOR: Mensagens de Erro Genéricas

**Problema:** Formulários mostram erro genérico em falhas

```typescript
// ❌ Pouco informativo
toast({
  title: 'Erro',
  description: error instanceof Error ? error.message : 'Erro ao criar ticket'
})

// ✅ Deveria ser contextual
if (error instanceof ValidationError) {
  // Listar erros de validação por campo
} else if (error instanceof NetworkError) {
  // Mensagem específica de conectividade
}
```

---

## 📊 TABELA RESUMIDA DE NÃO-CONFORMIDADES

| Pilar | Severidade | Quantidade | Arquivos Afetados |
|-------|-----------|-----------|-------------------|
| Estrutura/Next.js | ❌ CRÍTICO | 1 | 4+ componentes |
| Estrutura/Next.js | ⚠️ MÉDIO | 3 | 5+ arquivos |
| TypeScript | ❌ CRÍTICO | 1 (16+ `any`) | 10+ arquivos |
| TypeScript | ⚠️ MÉDIO | 3 | 3+ arquivos |
| Componentização | ❌ CRÍTICO | 1 | HeaderCidadao.tsx |
| Componentização | ⚠️ MÉDIO | 3 | 2+ arquivos |
| Estado/API | ⚠️ MÉDIO | 4 | 5+ arquivos |
| Formulários | ⚠️ MÉDIO | 2 | 2+ arquivos |
| **TOTAL** | - | **22** | - |

---

## 🔴 PROBLEMAS CRÍTICOS RECOMENDADOS PARA AÇÃO IMEDIATA

1. **Remover todos os `any`** → Implementar type-safety completa
2. **Separar Chakra UI de Tailwind CSS** → Escolher um único framework de styling
3. **Unificar nomenclatura** → Padrão consistente (português/inglês, suffixes)
4. **Consolidar stores duplicadas** → Uma única store por domínio
5. **Adicionar error handling às stores** → Estados loading/error globais

---

## 📝 RECOMENDAÇÕES PRIORITÁRIAS

### Priority 1 (P1) - Crítica
- [ ] Remover 16+ instâncias de `any` e tipificar corretamente
- [ ] Remover todas as classes `className` do HeaderCidadao (usar Chakra)
- [ ] Consolidar `notificacoesStore` e `notificationStore` em uma única

### Priority 2 (P2) - Alta
- [ ] Estabelecer padrão de nomenclatura único
- [ ] Adicionar estados `loading` e `error` em todas as stores
- [ ] Centralizar URLs de API em `.env` com exemplo em `.env.example`
- [ ] Remover Tailwind className de gestor/perfil/page.tsx

### Priority 3 (P3) - Média
- [ ] Extrair lógica de API de stores para serviços
- [ ] Tipificar todos os filtros e parâmetros de função
- [ ] Adicionar validação a todos os formulários
- [ ] Padronizar tratamento de erros com tipos específicos

### Priority 4 (P4) - Menor
- [ ] Melhorar mensagens de erro contextualizadas
- [ ] Adicionar feedback visual em operações async
- [ ] Documentar padrões de projeto em README técnico

---

## ✅ CONFORMIDADES POSITIVAS IDENTIFICADAS

- ✅ Uso correto de Zustand com typed state
- ✅ Schemas Zod bem definidos para validação
- ✅ Arquitetura em camadas (components, services, stores, types)
- ✅ Padrão Client Component corretamente aplicado (`'use client'`)
- ✅ Type exports centralizados em `src/types/index.ts`
- ✅ useForm hook abstrai react-hook-form + Zod

---

**Fim da Auditoria Técnica**

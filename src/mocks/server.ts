import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server para ambiente Node/Next.js
export const server = setupServer(...handlers)

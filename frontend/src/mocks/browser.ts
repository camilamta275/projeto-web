import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker para ambiente browser
export const worker = setupWorker(...handlers)

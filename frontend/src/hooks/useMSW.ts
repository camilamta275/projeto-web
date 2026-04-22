import { useEffect } from 'react'

export function useMSW() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inicializar MSW no cliente
      import('@/mocks/browser').then(({ worker }) => {
        worker.start()
      })
    }
  }, [])
}

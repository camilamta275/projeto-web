import { useState, useCallback } from 'react'

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  headers?: Record<string, string>
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

interface UseApiResponse<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  execute: () => Promise<T | null>
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {},
): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const result: T = await response.json()
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      options.onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, options])

  return { data, isLoading, error, execute }
}

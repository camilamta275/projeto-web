'use client'

import React from 'react'

const CHUNK_RELOAD_KEY = 'chunk-reload-attempted'

function isChunkLoadError(reason: unknown): boolean {
  if (!reason || typeof reason !== 'object') return false

  const error = reason as { name?: string; message?: string }
  const message = error.message ?? ''

  return (
    error.name === 'ChunkLoadError' ||
    message.includes('Loading chunk') ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Failed to fetch RSC payload')
  )
}

/**
 * After a Vercel redeploy, client-side navigation may request JS chunks
 * that no longer exist. Reload once so the browser fetches the latest build.
 */
export function ChunkErrorHandler() {
  React.useEffect(() => {
    const handleChunkFailure = (reason: unknown) => {
      if (!isChunkLoadError(reason)) return

      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY)
      if (alreadyReloaded) return

      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
      window.location.reload()
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleChunkFailure(event.reason)
    }

    const onError = (event: ErrorEvent) => {
      if (event.message) {
        handleChunkFailure({ message: event.message, name: 'ChunkLoadError' })
      }
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener('error', onError)

    const clearReloadFlag = window.setTimeout(() => {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    }, 10_000)

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener('error', onError)
      window.clearTimeout(clearReloadFlag)
    }
  }, [])

  return null
}

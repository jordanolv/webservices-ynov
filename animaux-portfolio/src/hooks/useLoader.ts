'use client'

import { useState, useEffect } from 'react'

export function useLoader(minDuration: number = 500) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const startTime = Date.now()

    const handleLoad = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDuration - elapsed)

      setTimeout(() => {
        setIsLoading(false)
      }, remainingTime)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [minDuration])

  return isLoading
}
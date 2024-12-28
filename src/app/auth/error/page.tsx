'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error === 'RegisterRequired') {
      router.replace('/users/registration')
    }
  }, [error, router])

  return null // or a loading spinner
} 
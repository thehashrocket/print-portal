'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}

function ErrorContent() {
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
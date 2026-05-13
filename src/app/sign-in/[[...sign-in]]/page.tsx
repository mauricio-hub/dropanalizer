'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0B0F14' }}>
      <SignIn path="/sign-in" routing="path" />
    </div>
  )
}

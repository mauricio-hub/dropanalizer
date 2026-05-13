'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0B0F14' }}>
      <SignUp path="/sign-up" routing="path" />
    </div>
  )
}

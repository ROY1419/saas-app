"use client"
import React, { Suspense } from 'react'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'

const LazyClerkProvider = React.lazy(() =>  import('@clerk/nextjs').then(module => module.ClerkProvider));
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyClerkProvider>
        <html lang="en">
          <body>
            <header>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            <main>{children}</main>
          </body>
        </html>
      </LazyClerkProvider>
    </Suspense>
  )
}



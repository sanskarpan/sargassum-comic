"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Lock } from "lucide-react"

// The hardcoded password
const SITE_PASSWORD = "sargassum2025"

interface PasswordProtectionProps {
  children: React.ReactNode
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem("comic-auth") === "true"
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === SITE_PASSWORD) {
      localStorage.setItem("comic-auth", "true")
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Incorrect password. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-lg p-8 rounded-lg border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password Protected</h1>
            <p className="text-white/70 text-center">This comic generator requires a password to access.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/30 border-white/20 text-white placeholder:text-white/50"
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Access Comic Generator
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

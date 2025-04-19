"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export function BackgroundImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRandomImage() {
      try {
        const response = await fetch("/api/random-panel")

        if (!response.ok) {
          // If no images are found, just return without setting an error
          if (response.status === 404) {
            setIsLoading(false)
            return
          }

          throw new Error("Failed to fetch random image")
        }

        const data = await response.json()
        setImageUrl(data.imageUrl)
      } catch (err) {
        console.error("Error fetching random image:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRandomImage()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-0">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    )
  }

  if (error || !imageUrl) {
    // Return empty div if there's an error or no image
    // This will fall back to the default background
    return <div className="fixed inset-0 bg-black z-0" />
  }

  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10" />
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt="Background"
        fill
        className="object-cover opacity-20"
        priority
        quality={60}
      />
    </div>
  )
}

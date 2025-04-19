"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface ComicPanelProps {
  imageUrl: string
}

export default function ComicPanel({ imageUrl }: ComicPanelProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      )}
      <div className="relative max-w-full max-h-full w-auto h-auto">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Comic panel"
          className={`object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          priority
          width={1024}
          height={1024}
          style={{
            maxWidth: "100vw",
            maxHeight: "100vh",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  )
}

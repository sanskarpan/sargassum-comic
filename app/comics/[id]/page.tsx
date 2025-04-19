"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Home, LogOut } from "lucide-react"
import type { Comic, Panel } from "@/lib/supabase"

export default function ComicViewPage() {
  const params = useParams()
  const router = useRouter()
  const comicId = params.id as string

  const [comic, setComic] = useState<Comic | null>(null)
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem("comic-auth")
    window.location.reload()
  }

  useEffect(() => {
    async function fetchComic() {
      try {
        const response = await fetch(`/api/comics?id=${comicId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch comic")
        }

        const data = await response.json()
        setComic(data.comic)
        setPanels(data.panels || [])
      } catch (err) {
        console.error("Error fetching comic:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (comicId) {
      fetchComic()
    }
  }, [comicId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading comic...</p>
      </div>
    )
  }

  if (error || !comic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || "Comic not found"}</p>
          <Button onClick={() => router.push("/comics")}>Back to Comics</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
          onClick={() => router.push("/comics")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">{comic.title || "Untitled Comic"}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{comic.initial_prompt}</p>
      </div>

      {panels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No panels found for this comic</p>
        </div>
      ) : (
        <div className="w-full">
          {panels.map((panel) => (
            <div key={panel.id} className="w-full h-screen flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={panel.image_url || "/placeholder.svg"}
                  alt={`Panel ${panel.sequence_number}`}
                  width={1024}
                  height={1024}
                  className="object-contain"
                  priority
                  style={{
                    maxWidth: "100vw",
                    maxHeight: "90vh",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

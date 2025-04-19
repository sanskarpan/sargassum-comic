"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"
import type { Comic, Panel } from "@/lib/supabase"

export default function ComicsPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comicPanels, setComicPanels] = useState<Record<string, Panel[]>>({})
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchComics()
  }, [])

  async function fetchComics() {
    setLoading(true)
    try {
      const response = await fetch("/api/comics")
      if (!response.ok) {
        throw new Error("Failed to fetch comics")
      }

      const data = await response.json()
      setComics(data.comics || [])

      // Fetch first panel for each comic
      const panelsData: Record<string, Panel[]> = {}

      for (const comic of data.comics) {
        const panelsResponse = await fetch(`/api/panels?comicId=${comic.id}`)
        if (panelsResponse.ok) {
          const panelsData2 = await panelsResponse.json()
          if (panelsData2.panels && panelsData2.panels.length > 0) {
            panelsData[comic.id] = panelsData2.panels
          }
        }
      }

      setComicPanels(panelsData)
    } catch (err) {
      console.error("Error fetching comics:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function seedDatabase() {
    setIsSeeding(true)
    setSeedMessage(null)

    try {
      const response = await fetch("/api/seed")
      const data = await response.json()

      setSeedMessage(data.message || "Database seeded")

      // Refresh comics list
      fetchComics()
    } catch (err) {
      console.error("Error seeding database:", err)
      setSeedMessage("Error seeding database")
    } finally {
      setIsSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading comics...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Comics</h1>
        <div className="flex gap-2">
          {comics.length === 0 && (
            <Button
              variant="outline"
              onClick={seedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
            >
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {isSeeding ? "Seeding..." : "Seed Database"}
            </Button>
          )}
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
              Create New Comic
            </Button>
          </Link>
        </div>
      </div>

      {seedMessage && (
        <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-6 text-sm">{seedMessage}</div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-6 text-sm text-destructive">
          Error: {error}
        </div>
      )}

      {comics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">You haven't created any comics yet</p>
          <Link href="/">
            <Button size="lg">Create Your First Comic</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comics.map((comic) => (
            <Card key={comic.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {comicPanels[comic.id] && comicPanels[comic.id][0] ? (
                  <Image
                    src={comicPanels[comic.id][0].image_url || "/placeholder.svg"}
                    alt={comic.title || "Comic panel"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No panels</p>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-1">{comic.title || "Untitled Comic"}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{comic.initial_prompt}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(comic.created_at).toLocaleDateString()}
                </p>
              </CardContent>

              <CardFooter>
                <Link href={`/comics/${comic.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-black/40 backdrop-blur-sm border-white/10 hover:bg-black/60 hover:border-white/30 transition-all"
                  >
                    View Comic
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

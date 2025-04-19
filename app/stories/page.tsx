"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"

interface Story {
  id: string
  title: string
  initial_prompt: string
  story_data: any
  created_at: string
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  async function fetchStories() {
    setLoading(true)
    try {
      const response = await fetch("/api/stories")
      if (!response.ok) {
        throw new Error("Failed to fetch stories")
      }

      const data = await response.json()
      setStories(data.stories || [])
    } catch (err) {
      console.error("Error fetching stories:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function seedDatabase() {
    setIsSeeding(true)
    setSeedMessage(null)

    try {
      const response = await fetch("/api/seed-stories")
      const data = await response.json()

      setSeedMessage(data.message || "Database seeded")

      // Refresh stories list
      fetchStories()
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
        <p>Loading stories...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Stories</h1>
        <div className="flex gap-2">
          {stories.length === 0 && (
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
              Create New Story
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

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">You haven't created any stories yet</p>
          <Link href="/">
            <Button size="lg">Create Your First Story</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {story.story_data?.scenes?.[0]?.image_url ? (
                  <img
                    src={story.story_data.scenes[0].image_url || "/placeholder.svg"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-1">{story.title || "Untitled Story"}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {story.story_data?.summary || story.initial_prompt}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(story.created_at).toLocaleDateString()}
                </p>
              </CardContent>

              <CardFooter>
                <Link href={`/stories/${story.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-black/40 backdrop-blur-sm border-white/10 hover:bg-black/60 hover:border-white/30 transition-all"
                  >
                    Read Story
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

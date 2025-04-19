"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Home, LogOut, ImageIcon } from "lucide-react"
import { StoryRenderer } from "@/components/story-renderer"
import { generateImage } from "@/lib/replicate"
import { ImagePlaceholder } from "@/components/image-placeholder"

interface Story {
  id: string
  title: string
  initial_prompt: string
  story_data: any
  created_at: string
}

export default function StoryViewPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string

  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingImageForScene, setGeneratingImageForScene] = useState<number | null>(null)

  const handleLogout = () => {
    localStorage.removeItem("comic-auth")
    window.location.reload()
  }

  useEffect(() => {
    async function fetchStory() {
      try {
        const response = await fetch(`/api/stories?id=${storyId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch story")
        }

        const data = await response.json()
        setStory(data.story)
      } catch (err) {
        console.error("Error fetching story:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      fetchStory()
    }
  }, [storyId])

  // Generate an image for a scene
  const generateSceneImage = async (scene: any, index: number) => {
    if (!storyId) return

    setGeneratingImageForScene(index)
    try {
      console.log("Generating image for scene:", scene)
      const prompt = `${scene.setting} with ${scene.conflict}. High quality, detailed illustration.`
      console.log("Using prompt:", prompt)
      
      const imageUrl = await generateImage(prompt, storyId, index)
      console.log("Generated image URL:", imageUrl)

      // Update the scene with the image URL
      const response = await fetch(`/api/stories/${storyId}/scenes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sceneIndex: index,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to update scene in database:", errorData)
        // Still update the UI even if database update fails
        if (story && story.story_data) {
          const updatedStoryData = { ...story.story_data }
          updatedStoryData.scenes[index].image_url = imageUrl
          setStory({
            ...story,
            story_data: updatedStoryData,
          })
        }
        throw new Error(errorData.error || "Failed to update scene in database")
      }

      const data = await response.json()
      console.log("Scene updated successfully:", data)

      // Update the local state
      if (story && story.story_data) {
        const updatedStoryData = { ...story.story_data }
        updatedStoryData.scenes[index].image_url = imageUrl
        setStory({
          ...story,
          story_data: updatedStoryData,
        })
      }
    } catch (error) {
      console.error("Failed to generate or update image:", error)
      setError(error instanceof Error ? error.message : "Failed to generate or update image")
    } finally {
      setGeneratingImageForScene(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading story...</p>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || "Story not found"}</p>
          <Button onClick={() => router.push("/stories")}>Back to Stories</Button>
        </div>
      </div>
    )
  }

  const storyData = story.story_data

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
          onClick={() => router.push("/stories")}
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

      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{storyData.title}</h1>
          <p className="text-xl text-white/80 italic">{storyData.tagline}</p>
        </div>

        {/* Story Content */}
        <div className="space-y-12">
          {/* Story Summary */}
          <div className="bg-black/40 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Story Summary</h2>
            <p className="text-white/90 leading-relaxed">{storyData.summary}</p>
          </div>

          {/* Story Content with Images */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Story</h2>

            {storyData.scenes.map((scene: any, index: number) => (
              <div key={index} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{scene.title}</h3>
                  {!scene.image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateSceneImage(scene, index)}
                      disabled={generatingImageForScene !== null}
                      className="bg-black/40 border-white/20"
                    >
                      {generatingImageForScene === index ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      )}
                      Generate Image
                    </Button>
                  )}
                </div>

                <div className="mb-4 text-sm text-white/70">
                  <p>
                    <strong>Setting:</strong> {scene.setting}
                  </p>
                  <p>
                    <strong>POV:</strong> {scene.pov}
                  </p>
                </div>

                <div className="mb-6">
                  {scene.image_url && !generatingImageForScene ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={scene.image_url}
                        alt={scene.title}
                        className="w-full h-auto object-contain max-h-[600px] mx-auto"
                      />
                    </div>
                  ) : (
                    <ImagePlaceholder isGenerating={generatingImageForScene === index} />
                  )}
                </div>

                <StoryRenderer
                  content={storyData.story.find((s: any) => s.beat === scene.beat)?.paragraphs.join("\n\n") || ""}
                />
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="text-sm text-white/60 border-t border-white/10 pt-4 mt-8">
            <p>
              Word Count: {storyData.metadata.word_count} • Estimated Reading Time:{" "}
              {storyData.metadata.read_time_minutes} minutes
            </p>
            <p>Generated on: {new Date(storyData.generated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

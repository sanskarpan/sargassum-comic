"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, Sparkles, Info, BookOpen, LogOut, ImageIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PromptSuggestions, DETAILED_SUGGESTIONS } from "@/components/prompt-suggestions"
import { PromptModal } from "@/components/prompt-modal"
import type { PromptSuggestion } from "@/components/prompt-suggestion-card"
import { createClientSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StoryRenderer } from "@/components/story-renderer"
import { generateImage } from "@/lib/replicate"
import { ImagePlaceholder } from "@/components/image-placeholder"

// Define the story structure based on the client's pipeline
interface RequestSpec {
  audience: string
  genre: string
  tone: string
  length_words: number
  theme: string
}

interface OutlineBeat {
  beat: number
  type: string
  description: string
}

interface Character {
  id: string
  name: string
  role: string
  arc: string
  traits: string[]
}

interface Scene {
  beat: number
  title: string
  setting: string
  pov: string
  conflict: string
  image_url?: string
}

interface StoryParagraphs {
  beat: number
  paragraphs: string[]
}

interface StoryPackage {
  version: string
  generated_at: string
  request_spec: RequestSpec
  title: string
  tagline: string
  summary: string
  characters: Character[]
  outline: OutlineBeat[]
  scenes: Scene[]
  story: StoryParagraphs[]
  metadata: {
    word_count: number
    read_time_minutes: number
  }
}

export default function StoryGenerator() {
  const [initialPrompt, setInitialPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<PromptSuggestion | null>(null)
  const [storyPackage, setStoryPackage] = useState<StoryPackage | null>(null)
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null)
  const [generatingImageForScene, setGeneratingImageForScene] = useState<number | null>(null)
  const [audience, setAudience] = useState("all ages")
  const [genre, setGenre] = useState("")
  const [tone, setTone] = useState("")
  const [wordCount, setWordCount] = useState(1500)

  // Improve the prompt using AI
  const improvePrompt = async () => {
    if (initialPrompt.length < 20 || isImprovingPrompt) return

    setIsImprovingPrompt(true)
    setError(null)

    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: initialPrompt }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      setInitialPrompt(data.improvedPrompt)
    } catch (error) {
      console.error("Failed to improve prompt:", error)
      setError(error instanceof Error ? error.message : "Failed to improve prompt")
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  // Create a new story in the database
  const createStory = async (storyData: StoryPackage): Promise<string> => {
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: storyData.title,
          initialPrompt: storyData.request_spec.theme,
          storyData: storyData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      return data.story.id
    } catch (error) {
      console.error("Failed to create story in database:", error)
      throw error
    }
  }

  // Generate an image for a scene
  const generateSceneImage = async (scene: Scene, index: number) => {
    if (!currentStoryId) return

    setGeneratingImageForScene(index)
    try {
      const prompt = `${scene.setting} with ${scene.conflict}. High quality, detailed illustration.`
      const imageUrl = await generateImage(prompt, currentStoryId, index)

      // Update the scene with the image URL
      if (storyPackage) {
        const updatedScenes = [...storyPackage.scenes]
        updatedScenes[index] = { ...scene, image_url: imageUrl }

        setStoryPackage({
          ...storyPackage,
          scenes: updatedScenes,
        })

        // Update the story in the database
        await fetch(`/api/stories/${currentStoryId}/scenes`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sceneIndex: index,
            imageUrl,
          }),
        })
      }
    } catch (error) {
      console.error("Failed to generate image:", error)
      setError(error instanceof Error ? error.message : "Failed to generate image")
    } finally {
      setGeneratingImageForScene(null)
    }
  }

  // Generate the story
  const generateStory = async () => {
    if (!initialPrompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      // Create request spec
      const requestSpec: RequestSpec = {
        audience: audience,
        genre: genre || "fantasy",
        tone: tone || "engaging",
        length_words: wordCount,
        theme: initialPrompt,
      }

      // Generate the story with streaming
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestSpec }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      // Initialize an empty story package
      const emptyStoryPackage: StoryPackage = {
        version: "1.0.0",
        generated_at: new Date().toISOString(),
        request_spec: requestSpec,
        title: "",
        tagline: "",
        summary: "",
        characters: [],
        outline: [],
        scenes: [],
        story: [],
        metadata: {
          word_count: 0,
          read_time_minutes: 0
        }
      }

      setStoryPackage(emptyStoryPackage)

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to get response reader")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            // Update the story package based on the type of data received
            setStoryPackage(prev => {
              if (!prev) return prev
              
              switch (data.type) {
                case 'structure':
                  return {
                    ...prev,
                    title: data.data.title,
                    tagline: data.data.tagline,
                    summary: data.data.summary,
                    outline: data.data.outline
                  }
                case 'characters':
                  return {
                    ...prev,
                    characters: data.data
                  }
                case 'scenes':
                  return {
                    ...prev,
                    scenes: data.data
                  }
                case 'story':
                  return {
                    ...prev,
                    story: data.data
                  }
                case 'error':
                  throw new Error(data.error)
                default:
                  return prev
              }
            })
          } catch (error) {
            console.error("Error parsing streaming data:", error)
          }
        }
      }

      // Create a new story in the database
      if (storyPackage) {
        const storyId = await createStory(storyPackage)
        setCurrentStoryId(storyId)

        // Update prompt history to mark this prompt as used
        const supabase = createClientSupabaseClient()
        await supabase.from("prompt_history").update({ was_used: true }).eq("prompt", initialPrompt)
      }
    } catch (error) {
      console.error("Failed to generate story:", error)
      setError(error instanceof Error ? error.message : "Failed to generate story")
    } finally {
      setIsGenerating(false)
    }
  }

  // Select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setInitialPrompt(suggestion)
  }

  // Open modal with suggestion details
  const openModal = (suggestion: PromptSuggestion) => {
    setSelectedSuggestion(suggestion)
    setModalOpen(true)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("comic-auth")
    window.location.reload()
  }

  // Update the scene rendering section to use the ImagePlaceholder
  const renderScene = (scene: Scene, index: number) => {
    return (
      <div key={index} className="mb-8">
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
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          ) : (
            <ImagePlaceholder isGenerating={generatingImageForScene === index} />
          )}
        </div>

        <StoryRenderer
          content={storyPackage?.story.find((s) => s.beat === scene.beat)?.paragraphs.join("\n\n") || ""}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      {!storyPackage ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4 py-12">
          <div className="w-full text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">Sargassum Story Gen</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Enter a prompt to generate an engaging story with beautiful illustrations.
            </p>

            <div className="mt-4 flex items-center justify-center">
              <Link
                href="/stories"
                className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm"
              >
                <BookOpen className="h-4 w-4" />
                View your saved stories
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8 max-w-2xl w-full animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="w-full max-w-2xl space-y-8 animate-slide-up">
            {/* Prompt Suggestions */}
            <PromptSuggestions
              onSelectPrompt={selectSuggestion}
              selectedPrompt={initialPrompt}
              onOpenModal={openModal}
            />

            {/* Story Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="audience" className="text-sm font-medium text-white mb-2 block">
                  Audience
                </label>
                <select
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-white"
                >
                  <option value="all ages">All Ages</option>
                  <option value="children">Children</option>
                  <option value="young adult">Young Adult</option>
                  <option value="adult">Adult</option>
                </select>
              </div>
              <div>
                <label htmlFor="genre" className="text-sm font-medium text-white mb-2 block">
                  Genre
                </label>
                <Input
                  id="genre"
                  placeholder="Fantasy, Sci-Fi, Mystery, etc."
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div>
                <label htmlFor="tone" className="text-sm font-medium text-white mb-2 block">
                  Tone
                </label>
                <Input
                  id="tone"
                  placeholder="Optimistic, Dark, Humorous, etc."
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div>
                <label htmlFor="wordCount" className="text-sm font-medium text-white mb-2 block">
                  Word Count
                </label>
                <Input
                  id="wordCount"
                  type="number"
                  min={500}
                  max={5000}
                  step={100}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number.parseInt(e.target.value))}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="prompt-input" className="text-base font-medium text-white">
                  Your Story Theme
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm flex items-center gap-1 text-white/60 hover:text-white/90 hover:bg-white/5"
                  onClick={() => {
                    // Find a random suggestion
                    const randomIndex = Math.floor(Math.random() * DETAILED_SUGGESTIONS.length)
                    openModal(DETAILED_SUGGESTIONS[randomIndex])
                  }}
                >
                  <Info className="h-4 w-4" />
                  Need inspiration?
                </Button>
              </div>

              <div className="relative group">
                <Textarea
                  id="prompt-input"
                  placeholder="Describe your story theme in detail (min. 20 characters)"
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.target.value)}
                  className="w-full min-h-[120px] text-base p-4 resize-y leading-relaxed font-medium bg-black/30 backdrop-blur-sm border-white/20 focus-visible:ring-primary/50 transition-all group-hover:border-white/30 rounded-lg pr-10"
                />

                {initialPrompt.length >= 20 && (
                  <Button
                    onClick={improvePrompt}
                    disabled={isImprovingPrompt}
                    className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    variant="ghost"
                    size="icon"
                    title="Enhance prompt with AI"
                  >
                    {isImprovingPrompt ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                )}

                <div className="absolute bottom-3 left-3 text-xs text-white/60">{initialPrompt.length} characters</div>
              </div>

              {initialPrompt.length < 20 && initialPrompt.length > 0 && (
                <p className="text-sm text-amber-500 font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Please enter at least {20 - initialPrompt.length} more characters
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button
                onClick={generateStory}
                disabled={isGenerating || initialPrompt.length < 20}
                className="w-full py-6 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  "Generate Your Story"
                )}
              </Button>
            </div>
          </div>

          {/* Modal for displaying full prompt details */}
          <PromptModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            suggestion={selectedSuggestion}
            onSelect={selectSuggestion}
          />
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-4 py-12">
          <div className="fixed top-4 right-4 z-10 flex gap-2">
            <Link href="/stories">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                My Stories
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
              onClick={() => {
                // Reset state to return to the prompt screen
                setStoryPackage(null)
                setCurrentStoryId(null)
              }}
            >
              New Story
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

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{storyPackage.title}</h1>
            <p className="text-xl text-white/80 italic">{storyPackage.tagline}</p>
          </div>

          {/* Story Content */}
          <div className="space-y-12">
            {/* Story Summary */}
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Story Summary</h2>
                <p className="text-white/90 leading-relaxed">{storyPackage.summary}</p>
              </CardContent>
            </Card>

            {/* Characters */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Characters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyPackage.characters.map((character) => (
                  <Card key={character.id} className="bg-black/40 border-white/10">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{character.name}</h3>
                      <p className="text-white/70 text-sm mb-2">
                        <span className="font-medium">{character.role}</span> • {character.arc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {character.traits.map((trait, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Story Content with Images */}
            <div className="mt-8 space-y-8">
              <h2 className="text-2xl font-bold">Your Story</h2>
              {storyPackage.scenes.map((scene, index) => renderScene(scene, index))}
            </div>

            {/* Metadata */}
            <div className="text-sm text-white/60 border-t border-white/10 pt-4 mt-8">
              <p>
                Word Count: {storyPackage.metadata.word_count} • Estimated Reading Time:{" "}
                {storyPackage.metadata.read_time_minutes} minutes
              </p>
              <p>Generated on: {new Date(storyPackage.generated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

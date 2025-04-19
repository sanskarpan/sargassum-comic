"use client"

import { useEffect, useState, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { generateComic } from "@/lib/replicate"
import ComicPanel from "@/components/comic-panel"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, Sparkles, Info, BookOpen, LogOut } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PromptSuggestions, DETAILED_SUGGESTIONS } from "@/components/prompt-suggestions"
import { PromptModal } from "@/components/prompt-modal"
import type { PromptSuggestion } from "@/components/prompt-suggestion-card"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useScreenDimensions } from "@/hooks/use-screen-dimensions"
import Link from "next/link"

export default function ComicGenerator() {
  const [comicPanels, setComicPanels] = useState<Array<{ id: string; imageUrl: string; prompt: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState("")
  const [story, setStory] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<PromptSuggestion | null>(null)
  const [currentComicId, setCurrentComicId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const lastPromptRef = useRef("")
  const { aspectRatio } = useScreenDimensions()

  // Set up intersection observer for the last panel
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Generate a new panel when the last one comes into view
  useEffect(() => {
    if (inView && started && !isGenerating && comicPanels.length > 0) {
      generateNextPanel()
    }
  }, [inView, started, isGenerating, comicPanels.length])

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

  // Create a new comic in the database
  const createComic = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch("/api/comics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initialPrompt: prompt,
          title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      return data.comic.id
    } catch (error) {
      console.error("Failed to create comic in database:", error)
      throw error
    }
  }

  // Save a panel to the database
  const savePanel = async (comicId: string, prompt: string, imageUrl: string, sequenceNumber: number) => {
    try {
      const response = await fetch("/api/panels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comicId,
          prompt,
          imageUrl,
          sequenceNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to save panel to database:", error)
      throw error
    }
  }

  // Add this function near the other functions in the component
  const handleLogout = () => {
    localStorage.removeItem("comic-auth")
    window.location.reload()
  }

  // Start the comic with an initial prompt
  const startComic = async () => {
    if (!initialPrompt.trim() || isGenerating) return

    setStarted(true)
    setIsGenerating(true)
    setError(null)

    try {
      // Create a new comic in the database
      const comicId = await createComic(initialPrompt)
      setCurrentComicId(comicId)

      // Update prompt history to mark this prompt as used
      const supabase = createClientSupabaseClient()
      await supabase.from("prompt_history").update({ was_used: true }).eq("prompt", initialPrompt)

      // Generate first panel
      const firstPrompt = `Comic panel: ${initialPrompt}. Detailed, vibrant, comic book style.`
      lastPromptRef.current = firstPrompt

      console.log("Generating initial comic panel with prompt:", firstPrompt)
      const imageUrl = await generateComic(firstPrompt, comicId, 1, aspectRatio)

      if (imageUrl) {
        const newPanel = { id: "1", imageUrl, prompt: firstPrompt }
        setComicPanels([newPanel])

        // Save the panel to the database
        await savePanel(comicId, firstPrompt, imageUrl, 1)

        // Generate story progression
        const storyPrompts = await generateStoryProgression(initialPrompt, comicId)
        setStory(storyPrompts)
      }
    } catch (error) {
      console.error("Failed to generate initial comic panel:", error)
      setError(error instanceof Error ? error.message : "Failed to generate comic panel")
      setStarted(false)
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate the next panel in the comic
  const generateNextPanel = async () => {
    if (isGenerating || story.length === 0 || !currentComicId) return

    setIsGenerating(true)
    setError(null)

    try {
      const nextPrompt = story.shift() || ""
      const fullPrompt = `Comic panel: ${nextPrompt}. Detailed, vibrant, comic book style.`
      lastPromptRef.current = fullPrompt
      const sequenceNumber = comicPanels.length + 1

      console.log("Generating next comic panel with prompt:", fullPrompt)
      const imageUrl = await generateComic(fullPrompt, currentComicId, sequenceNumber, aspectRatio)

      if (imageUrl) {
        const newPanel = {
          id: String(sequenceNumber),
          imageUrl,
          prompt: fullPrompt,
        }

        setComicPanels((prev) => [...prev, newPanel])

        // Save the panel to the database
        await savePanel(currentComicId, fullPrompt, imageUrl, sequenceNumber)

        // If we're running low on story prompts, generate more
        if (story.length < 3) {
          const lastPrompt = story.length > 0 ? story[story.length - 1] : nextPrompt
          const newStoryPrompts = await generateStoryProgression(lastPrompt, currentComicId)
          setStory((prev) => [...prev, ...newStoryPrompts])
        }
      }
    } catch (error) {
      console.error("Failed to generate next comic panel:", error)
      setError(error instanceof Error ? error.message : "Failed to generate next comic panel")
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate story progression based on the last prompt
  const generateStoryProgression = async (prompt: string, comicId?: string): Promise<string[]> => {
    try {
      console.log("Generating story progression for prompt:", prompt)
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          comicId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      console.log("Story progression response:", data)
      return data.storyPrompts || []
    } catch (error) {
      console.error("Error generating story progression:", error)
      throw error
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

  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      {!started ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4 py-12">
          <div className="w-full text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">Sargassum Comic Gen</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Enter a prompt to start your comic adventure. As you scroll, new panels will be generated automatically.
            </p>

            <div className="mt-4 flex items-center justify-center">
              <Link
                href="/comics"
                className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm"
              >
                <BookOpen className="h-4 w-4" />
                View your saved comics
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

            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="prompt-input" className="text-base font-medium text-white">
                  Your Story Prompt
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
                  placeholder="Describe your comic scene in detail (min. 20 characters)"
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
                onClick={startComic}
                disabled={isGenerating || initialPrompt.length < 20}
                className="w-full py-6 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Start Your Comic Adventure"
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
        <div className="w-full">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="fixed top-4 right-4 z-10 flex gap-2">
            <Link href="/comics">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                My Comics
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="bg-black/60 backdrop-blur-sm border-white/20 hover:bg-black/70 hover:border-white/40 transition-all shadow-lg"
              onClick={() => {
                // Reset state to return to the prompt screen
                setStarted(false)
                setComicPanels([])
                setStory([])
                setCurrentComicId(null)
              }}
            >
              New Comic
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

          {comicPanels.map((panel, index) => (
            <div key={panel.id} ref={index === comicPanels.length - 1 ? ref : undefined} className="w-full">
              <ComicPanel imageUrl={panel.imageUrl} />
            </div>
          ))}

          {isGenerating && (
            <div className="w-full h-screen flex items-center justify-center">
              <div className="flex flex-col items-center bg-black/50 backdrop-blur-md p-6 rounded-lg">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-xl">Generating next panel...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

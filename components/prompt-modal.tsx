"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PromptSuggestion } from "./prompt-suggestion-card"

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  suggestion: PromptSuggestion | null
  onSelect: (prompt: string) => void
}

export function PromptModal({ isOpen, onClose, suggestion, onSelect }: PromptModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = "hidden"
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = ""
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const handleSelect = () => {
    if (suggestion) {
      onSelect(suggestion.fullPrompt)
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-black/80 backdrop-blur-md w-full max-w-lg rounded-lg shadow-xl transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {suggestion && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{suggestion.title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-white/90">Description</h3>
                <p className="text-sm leading-relaxed text-white/80">{suggestion.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-white/90">Characters</h3>
                <ul className="space-y-2">
                  {suggestion.characters.map((character, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg text-sm">
                      <span className="text-xs font-medium text-white/60 mt-0.5">{i + 1}.</span>
                      <p className="text-white/80">{character}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-white/90">Setting</h3>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-sm leading-relaxed text-white/80">{suggestion.setting}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-white/90">Storyboard Outline</h3>
                <ol className="space-y-2">
                  {suggestion.storyboard.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg text-sm">
                      <span className="text-xs font-medium text-white/60 mt-0.5">{i + 1}.</span>
                      <p className="leading-relaxed text-white/80">{point}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white/5 p-3 rounded-lg">
                <h3 className="text-sm font-semibold mb-1 text-white/90">Full Prompt</h3>
                <p className="italic text-sm leading-relaxed text-white/80">{suggestion.fullPrompt}</p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSelect}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Use This Prompt
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

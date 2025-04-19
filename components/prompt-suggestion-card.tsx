"use client"

import { cn } from "@/lib/utils"

export interface PromptSuggestion {
  title: string
  description: string
  characters: string[]
  setting: string
  storyboard: string[]
  fullPrompt: string
}

interface PromptSuggestionCardProps {
  suggestion: PromptSuggestion
  onClick: () => void
  isSelected: boolean
}

export function PromptSuggestionCard({ suggestion, onClick, isSelected }: PromptSuggestionCardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-200 cursor-pointer rounded-lg p-3 hover:bg-white/5",
        isSelected ? "bg-white/10 ring-1 ring-white/30" : "bg-transparent hover:bg-white/5",
      )}
      onClick={onClick}
    >
      <h3
        className={cn(
          "text-sm font-medium text-center line-clamp-2 transition-colors",
          isSelected ? "text-white font-semibold" : "text-white/80",
        )}
      >
        {suggestion.title}
      </h3>
      {isSelected && <div className="h-0.5 w-full bg-white/30 mt-2" />}
    </div>
  )
}

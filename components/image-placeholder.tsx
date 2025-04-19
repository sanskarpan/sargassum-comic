import { ImageIcon } from "lucide-react"

interface ImagePlaceholderProps {
  isGenerating: boolean
  className?: string
}

export function ImagePlaceholder({ isGenerating, className = "" }: ImagePlaceholderProps) {
  return (
    <div className={`relative w-full aspect-video bg-gradient-to-br from-black/40 to-black/20 rounded-lg overflow-hidden border border-white/10 ${className}`}>
      {isGenerating ? (
        <>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-white/80 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white/90 text-sm font-medium mb-1">Creating your masterpiece</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-white/40" />
            <p className="text-white/40 text-sm">Click to generate image</p>
          </div>
        </div>
      )}
    </div>
  )
} 
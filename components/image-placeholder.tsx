import { ImageIcon, Loader2 } from "lucide-react"

interface ImagePlaceholderProps {
  isGenerating: boolean
  className?: string
  onClick?: () => void
}

export function ImagePlaceholder({ isGenerating, onClick, className = "" }: ImagePlaceholderProps) {
  return (
    <div 
      className={`relative w-full aspect-video bg-gradient-to-br from-black/40 to-black/20 rounded-lg overflow-hidden border border-white/10 ${isGenerating ? 'border-purple-500/30 shadow-glow' : ''} ${className}`}
      onClick={!isGenerating && onClick ? onClick : undefined}
      style={!isGenerating && onClick ? { cursor: 'pointer' } : undefined}
    >
      {isGenerating ? (
        <>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
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
            <p className="text-white/40 text-sm">{onClick ? "Click to generate image" : "No image available"}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Add CSS for the shadow glow effect
const style = document.createElement('style');
style.textContent = `
  .shadow-glow {
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
    transition: all 0.3s ease;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
} 
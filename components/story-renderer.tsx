"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card } from "@/components/ui/card"

interface StoryRendererProps {
  content: string
}

export function StoryRenderer({ content }: StoryRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="animate-pulse bg-white/5 h-40 rounded-lg"></div>
  }

  return (
    <Card className="bg-black/20 border-white/10 overflow-hidden">
      <div className="prose prose-invert max-w-none p-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-white" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 text-white" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 text-white" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-white/90" {...props} />,
            a: ({ node, ...props }) => <a className="text-purple-400 hover:text-purple-300 underline" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-white/80" {...props} />
            ),
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-white/90" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-white/90" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code className="bg-white/10 px-1 py-0.5 rounded text-sm" {...props} />
              ) : (
                <code className="block bg-black/50 p-4 rounded-md overflow-x-auto text-sm my-4" {...props} />
              ),
            em: ({ node, ...props }) => <em className="italic text-white/90" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  )
}

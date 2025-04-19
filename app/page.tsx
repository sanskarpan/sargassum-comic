import StoryGenerator from "@/components/story-generator"
import { BackgroundImage } from "@/components/background-image"

export default function Home() {
  return (
    <main className="min-h-screen text-white relative">
      <BackgroundImage />
      <div className="relative z-10">
        <StoryGenerator />
      </div>
    </main>
  )
}

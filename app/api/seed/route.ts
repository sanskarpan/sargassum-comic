import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Sample data for seeding
const SAMPLE_COMICS = [
  {
    title: "Krishna's Divine Revelation",
    initial_prompt: "Krishna revealing his cosmic form to Arjuna on the battlefield of Kurukshetra",
  },
  {
    title: "Hanuman's Leap",
    initial_prompt: "Hanuman leaping across the ocean to Lanka with the mountain of healing herbs",
  },
  {
    title: "Durga's Battle",
    initial_prompt: "Goddess Durga riding her lion into battle against the demon Mahishasura",
  },
]

// Sample panel image URLs (these would normally be generated)
const SAMPLE_PANEL_URLS = [
  "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1000",
  "https://images.unsplash.com/photo-1618759287629-ca97956abea9?q=80&w=1000",
  "https://images.unsplash.com/photo-1547995886-6dc09384c6e6?q=80&w=1000",
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=1000",
  "https://images.unsplash.com/photo-1636142369554-bb3c188f7266?q=80&w=1000",
]

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if we already have comics
    const { count, error: countError } = await supabase.from("comics").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking comics count:", countError)
      return NextResponse.json({ error: "Failed to check comics count" }, { status: 500 })
    }

    // If we already have comics, don't seed
    if (count && count > 0) {
      return NextResponse.json({ message: "Database already has comics, skipping seed" })
    }

    // Insert sample comics
    const results = []

    for (const comic of SAMPLE_COMICS) {
      const { data: newComic, error: comicError } = await supabase.from("comics").insert(comic).select().single()

      if (comicError) {
        console.error("Error creating sample comic:", comicError)
        continue
      }

      // Add 2-3 panels for each comic
      const panelCount = Math.floor(Math.random() * 2) + 2 // 2-3 panels

      for (let i = 0; i < panelCount; i++) {
        // Get a random image URL from our samples
        const randomImageUrl = SAMPLE_PANEL_URLS[Math.floor(Math.random() * SAMPLE_PANEL_URLS.length)]

        const { error: panelError } = await supabase.from("panels").insert({
          comic_id: newComic.id,
          prompt: `Panel ${i + 1} for ${comic.title}`,
          image_url: randomImageUrl,
          sequence_number: i + 1,
        })

        if (panelError) {
          console.error("Error creating sample panel:", panelError)
        }
      }

      results.push({
        comic: newComic.title,
        panels: panelCount,
      })
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      results,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

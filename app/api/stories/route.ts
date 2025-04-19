import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { title, initialPrompt, storyData } = await request.json()

    if (!initialPrompt || !storyData) {
      return NextResponse.json({ error: "Initial prompt and story data are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Create a new story
    const { data: story, error } = await supabase
      .from("stories")
      .insert({
        title: title || "Untitled Story",
        initial_prompt: initialPrompt,
        story_data: storyData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating story:", error)
      return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error("Error in stories API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get("id")

    const supabase = createServerSupabaseClient()

    if (storyId) {
      // Get a specific story
      const { data: story, error: storyError } = await supabase.from("stories").select("*").eq("id", storyId).single()

      if (storyError) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 })
      }

      return NextResponse.json({ story })
    } else {
      // Get all stories
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching stories:", error)
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
      }

      return NextResponse.json({ stories: stories || [] })
    }
  } catch (error) {
    console.error("Error in stories API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

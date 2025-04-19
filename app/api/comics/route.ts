import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { initialPrompt, title } = await request.json()

    if (!initialPrompt) {
      return NextResponse.json({ error: "Initial prompt is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Create a new comic
    const { data: comic, error } = await supabase
      .from("comics")
      .insert({
        initial_prompt: initialPrompt,
        title: title || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating comic:", error)
      return NextResponse.json({ error: "Failed to create comic" }, { status: 500 })
    }

    return NextResponse.json({ comic })
  } catch (error) {
    console.error("Error in comics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const comicId = searchParams.get("id")

    const supabase = createServerSupabaseClient()

    if (comicId) {
      // Get a specific comic with its panels
      const { data: comic, error: comicError } = await supabase.from("comics").select("*").eq("id", comicId).single()

      if (comicError) {
        return NextResponse.json({ error: "Comic not found" }, { status: 404 })
      }

      const { data: panels, error: panelsError } = await supabase
        .from("panels")
        .select("*")
        .eq("comic_id", comicId)
        .order("sequence_number", { ascending: true })

      if (panelsError) {
        console.error("Error fetching panels:", panelsError)
      }

      return NextResponse.json({ comic, panels: panels || [] })
    } else {
      // Get all comics
      const { data: comics, error } = await supabase
        .from("comics")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comics:", error)
        return NextResponse.json({ error: "Failed to fetch comics" }, { status: 500 })
      }

      return NextResponse.json({ comics: comics || [] })
    }
  } catch (error) {
    console.error("Error in comics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { comicId, prompt, imageUrl, sequenceNumber } = await request.json()

    if (!comicId || !prompt || !imageUrl || sequenceNumber === undefined) {
      return NextResponse.json(
        {
          error: "Comic ID, prompt, image URL, and sequence number are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Create a new panel
    const { data: panel, error } = await supabase
      .from("panels")
      .insert({
        comic_id: comicId,
        prompt,
        image_url: imageUrl,
        sequence_number: sequenceNumber,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating panel:", error)
      return NextResponse.json({ error: "Failed to create panel" }, { status: 500 })
    }

    return NextResponse.json({ panel })
  } catch (error) {
    console.error("Error in panels API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const comicId = searchParams.get("comicId")

    if (!comicId) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get panels for a specific comic
    const { data: panels, error } = await supabase
      .from("panels")
      .select("*")
      .eq("comic_id", comicId)
      .order("sequence_number", { ascending: true })

    if (error) {
      console.error("Error fetching panels:", error)
      return NextResponse.json({ error: "Failed to fetch panels" }, { status: 500 })
    }

    return NextResponse.json({ panels: panels || [] })
  } catch (error) {
    console.error("Error in panels API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

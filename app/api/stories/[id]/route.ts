import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id
    const { scenes } = await request.json()

    if (!scenes) {
      return NextResponse.json({ error: "Scenes data is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // First, get the current story data
    const { data: story, error: getError } = await supabase
      .from("stories")
      .select("story_data")
      .eq("id", storyId)
      .single()

    if (getError) {
      console.error("Error fetching story:", getError)
      return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
    }

    // Update the scenes in the story data
    const storyData = story.story_data
    if (storyData) {
      storyData.scenes = scenes

      // Update the story in the database
      const { error: updateError } = await supabase
        .from("stories")
        .update({ story_data: storyData })
        .eq("id", storyId)

      if (updateError) {
        console.error("Error updating story:", updateError)
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
      }

      return NextResponse.json({ success: true, scenes: storyData.scenes })
    } else {
      return NextResponse.json({ error: "Story data not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
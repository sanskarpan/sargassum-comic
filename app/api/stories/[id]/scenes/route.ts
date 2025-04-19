import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const storyId = context.params.id
    const { sceneIndex, imageUrl } = await request.json()

    if (sceneIndex === undefined || !imageUrl) {
      return NextResponse.json({ error: "Scene index and image URL are required" }, { status: 400 })
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

    // Update the scene with the image URL
    const storyData = story.story_data
    if (storyData && storyData.scenes && storyData.scenes[sceneIndex]) {
      storyData.scenes[sceneIndex].image_url = imageUrl

      // Update the story in the database
      const { error: updateError } = await supabase
        .from("stories")
        .update({ story_data: storyData })
        .eq("id", storyId)

      if (updateError) {
        console.error("Error updating story:", updateError)
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
      }

      return NextResponse.json({ success: true, scene: storyData.scenes[sceneIndex] })
    } else {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating scene:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

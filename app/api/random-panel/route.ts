import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get a random panel from the database
    const { data: panel, error } = await supabase
      .from("panels")
      .select("image_url")
      .order("created_at", { ascending: false })
      .limit(50) // Limit to recent panels for better quality
      .then((result) => {
        if (result.data && result.data.length > 0) {
          // Select a random panel from the results
          const randomIndex = Math.floor(Math.random() * result.data.length)
          return {
            data: result.data[randomIndex],
            error: result.error,
          }
        }
        return result
      })

    if (error) {
      console.error("Error fetching random panel:", error)
      return NextResponse.json({ error: "Failed to fetch random panel" }, { status: 500 })
    }

    if (!panel) {
      return NextResponse.json({ error: "No panels found" }, { status: 404 })
    }

    return NextResponse.json({ imageUrl: panel.image_url })
  } catch (error) {
    console.error("Error in random panel API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

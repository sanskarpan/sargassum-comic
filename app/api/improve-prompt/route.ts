import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || prompt.length < 20) {
      return NextResponse.json({ error: "Prompt must be at least 20 characters long" }, { status: 400 })
    }

    console.log("Improving prompt:", prompt)

    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a comic book writer specializing in Indian mythology. 
      Enhance the following prompt to create a more vivid, detailed, and engaging comic book scene. 
      Include specific elements from Indian mythology where appropriate.
      Keep the improved prompt concise (under 100 words) but rich in visual and narrative detail.

Original prompt: ${prompt}

Improved prompt:`,
      temperature: 0.7,
      maxTokens: 300,
    })

    const improvedPrompt = result.text.trim()
    console.log("Improved prompt:", improvedPrompt)

    // Store the prompt and improved version in the database
    const supabase = createServerSupabaseClient()
    const { error: dbError } = await supabase.from("prompt_history").insert({
      prompt,
      improved_prompt: improvedPrompt,
      was_used: false,
    })

    if (dbError) {
      console.error("Error storing prompt in database:", dbError)
    }

    return NextResponse.json({
      improvedPrompt,
    })
  } catch (error) {
    console.error("Error improving prompt:", error)

    let errorMessage = "Failed to improve prompt"
    if (error instanceof Error) {
      errorMessage = `Failed to improve prompt: ${error.message}`
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

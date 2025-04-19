import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { requestSpec } = await request.json()

    if (!requestSpec || !requestSpec.theme) {
      return NextResponse.json({ error: "Theme is required in the request spec" }, { status: 400 })
    }

    console.log("Generating story with theme:", requestSpec.theme)

    // Generate the story package using OpenAI
    const result = await generateText({
      model: openai("gpt-4"),
      prompt: `You are a professional storyteller specializing in ${requestSpec.genre || "fantasy"} stories. 
      Create a complete story package based on the following specifications:
      
      Audience: ${requestSpec.audience || "all ages"}
      Genre: ${requestSpec.genre || "fantasy"}
      Tone: ${requestSpec.tone || "engaging"}
      Target Word Count: ${requestSpec.length_words || 1500}
      Theme: ${requestSpec.theme}
      
      Generate a complete story package following this JSON structure:
      {
        "version": "1.0.0",
        "generated_at": "current timestamp",
        "request_spec": {
          "audience": "audience",
          "genre": "genre",
          "tone": "tone",
          "length_words": number,
          "theme": "theme"
        },
        "title": "An engaging title for the story",
        "tagline": "A short, catchy tagline",
        "summary": "A brief summary of the story (2-3 sentences)",
        "characters": [
          {
            "id": "character1",
            "name": "Character Name",
            "role": "protagonist/antagonist/etc",
            "arc": "character development trajectory",
            "traits": ["trait1", "trait2", "trait3"]
          }
        ],
        "outline": [
          {
            "beat": 1,
            "type": "setup",
            "description": "Description of the setup"
          },
          {
            "beat": 2,
            "type": "inciting_incident",
            "description": "Description of the inciting incident"
          },
          {
            "beat": 3,
            "type": "rising_action",
            "description": "Description of the rising action"
          },
          {
            "beat": 4,
            "type": "climax",
            "description": "Description of the climax"
          },
          {
            "beat": 5,
            "type": "resolution",
            "description": "Description of the resolution"
          }
        ],
        "scenes": [
          {
            "beat": 1,
            "title": "Scene Title",
            "setting": "Scene Setting",
            "pov": "Character POV",
            "conflict": "Scene Conflict"
          }
        ],
        "story": [
          {
            "beat": 1,
            "paragraphs": ["Paragraph 1", "Paragraph 2"]
          }
        ],
        "metadata": {
          "word_count": actual word count,
          "read_time_minutes": estimated reading time
        }
      }
      
      Make sure to:
      1. Create 3-5 well-developed characters
      2. Follow the 5-beat story structure in the outline
      3. Create 5-7 scenes that correspond to the beats
      4. Write engaging, well-crafted paragraphs for each scene
      5. Use markdown formatting in the paragraphs for emphasis, dialogue, etc.
      6. Ensure the story has a clear beginning, middle, and end
      7. Match the tone and style to the requested audience and genre
      8. Include vivid descriptions that would work well with illustrations
      
      Return ONLY the valid JSON with no additional text or explanation.`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the JSON response
    let storyPackage
    try {
      // Find the JSON object in the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        storyPackage = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No valid JSON found in the response")
      }
    } catch (parseError) {
      console.error("Error parsing story JSON:", parseError)
      console.log("Raw response:", result.text)
      return NextResponse.json({ error: "Failed to parse story data. Please try again." }, { status: 422 })
    }

    // Set the current timestamp if not provided
    if (!storyPackage.generated_at) {
      storyPackage.generated_at = new Date().toISOString()
    }

    console.log("Story generated successfully")

    return NextResponse.json({ storyPackage })
  } catch (error) {
    console.error("Error generating story:", error)

    // Provide more detailed error information
    let errorMessage = "Failed to generate story"
    if (error instanceof Error) {
      errorMessage = `Failed to generate story: ${error.message}`
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

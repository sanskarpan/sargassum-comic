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

    // Create a TransformStream for streaming the response
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start the story generation process
    const generateStory = async () => {
      try {
        // Step 1: Generate basic story structure
        const structureResult = await generateText({
          model: openai("gpt-4"),
          prompt: `Create a concise story structure for a ${requestSpec.genre || "fantasy"} story with this theme: ${requestSpec.theme}
          
          Return a JSON object with:
          {
            "title": "Story title",
            "tagline": "Short tagline",
            "summary": "2-3 sentence summary",
            "outline": [
              {"beat": 1, "type": "setup", "description": "Brief setup"},
              {"beat": 2, "type": "inciting_incident", "description": "Brief incident"},
              {"beat": 3, "type": "rising_action", "description": "Brief rising action"},
              {"beat": 4, "type": "climax", "description": "Brief climax"},
              {"beat": 5, "type": "resolution", "description": "Brief resolution"}
            ]
          }`,
          temperature: 0.7,
          maxTokens: 1000,
        })

        // Parse and send the structure
        const structure = JSON.parse(structureResult.text.match(/\{[\s\S]*\}/)[0])
        await writer.write(encoder.encode(JSON.stringify({ type: 'structure', data: structure }) + '\n'))

        // Step 2: Generate characters
        const charactersResult = await generateText({
          model: openai("gpt-4"),
          prompt: `Create 3-5 characters for this story structure: ${JSON.stringify(structure)}
          
          Return a JSON array of characters:
          [{
            "id": "character1",
            "name": "Character Name",
            "role": "protagonist/antagonist/etc",
            "arc": "Brief character arc",
            "traits": ["trait1", "trait2", "trait3"]
          }]`,
          temperature: 0.7,
          maxTokens: 800,
        })

        // Parse and send the characters
        const characters = JSON.parse(charactersResult.text.match(/\[[\s\S]*\]/)[0])
        await writer.write(encoder.encode(JSON.stringify({ type: 'characters', data: characters }) + '\n'))

        // Step 3: Generate scenes
        const scenesResult = await generateText({
          model: openai("gpt-4"),
          prompt: `Create 5-7 scenes for this story structure: ${JSON.stringify(structure)}
          
          Return a JSON array of scenes:
          [{
            "beat": 1,
            "title": "Scene Title",
            "setting": "Scene Setting",
            "pov": "Character POV",
            "conflict": "Scene Conflict"
          }]`,
          temperature: 0.7,
          maxTokens: 800,
        })

        // Parse and send the scenes
        const scenes = JSON.parse(scenesResult.text.match(/\[[\s\S]*\]/)[0])
        await writer.write(encoder.encode(JSON.stringify({ type: 'scenes', data: scenes }) + '\n'))

        // Step 4: Generate story content
        const storyResult = await generateText({
          model: openai("gpt-4"),
          prompt: `Write the story content for these scenes: ${JSON.stringify(scenes)}
          
          Return a JSON array of story beats:
          [{
            "beat": 1,
            "paragraphs": ["Paragraph 1", "Paragraph 2"]
          }]`,
          temperature: 0.7,
          maxTokens: 1500,
        })

        // Parse and send the story content
        const story = JSON.parse(storyResult.text.match(/\[[\s\S]*\]/)[0])
        await writer.write(encoder.encode(JSON.stringify({ type: 'story', data: story }) + '\n'))

        // Send completion message
        await writer.write(encoder.encode(JSON.stringify({ type: 'complete' }) + '\n'))
        await writer.close()
      } catch (error) {
        console.error('Error in story generation:', error)
        await writer.write(encoder.encode(JSON.stringify({ 
          type: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        }) + '\n'))
        await writer.close()
      }
    }

    // Start the generation process
    generateStory()

    // Return the streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

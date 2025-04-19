import { replicate } from "@ai-sdk/replicate"
import { experimental_generateImage as generateImage } from "ai"
import { NextResponse } from "next/server"
import { uploadImageToBlob } from "@/lib/blob-storage"

// Define valid image sizes
type ImageSize = "1024x1024" | "1024x576" | "1024x683" | "1024x768" | "576x1024" | "768x1024" | "819x1024"

export async function POST(request: Request) {
  try {
    const { prompt, storyId, sceneIndex, aspectRatio } = await request.json()

    console.log("Generating image with prompt:", prompt)
    console.log("Using aspect ratio:", aspectRatio || "default")

    // Determine image size based on aspect ratio
    let size: ImageSize = "1024x1024" // Default square

    if (aspectRatio) {
      // Round to nearest standard size while maintaining aspect ratio
      if (aspectRatio > 1) {
        // Landscape
        if (aspectRatio >= 1.9) {
          // Ultra-wide
          size = "1024x576" // 16:9
        } else if (aspectRatio >= 1.5) {
          size = "1024x683" // 3:2
        } else {
          size = "1024x768" // 4:3
        }
      } else if (aspectRatio < 1) {
        // Portrait
        if (aspectRatio <= 0.6) {
          // Very tall
          size = "576x1024" // 9:16
        } else if (aspectRatio <= 0.75) {
          size = "768x1024" // 3:4
        } else {
          size = "819x1024" // 4:5
        }
      }
    }

    console.log("Using image size:", size)

    const result = await generateImage({
      model: replicate.image("black-forest-labs/flux-schnell"),
      prompt,
      size,
    })

    // Get base64 image data
    const base64Image = result.image.base64

    // Store image in Vercel Blob if storyId is provided
    let imageUrl = base64Image
    if (storyId && sceneIndex !== undefined) {
      imageUrl = await uploadImageToBlob(base64Image, storyId, sceneIndex)
      console.log("Image stored in Vercel Blob:", imageUrl)
    }

    console.log("Image generation successful")

    return NextResponse.json({
      success: true,
      imageData: base64Image,
      storedImageUrl: imageUrl !== base64Image ? imageUrl : null,
      size,
    })
  } catch (error) {
    console.error("Error generating image with Replicate:", error)

    // Provide more detailed error information
    let errorMessage = "Failed to generate image"
    if (error instanceof Error) {
      errorMessage = `Failed to generate image: ${error.message}`
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

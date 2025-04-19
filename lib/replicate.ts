export async function generateImage(
  prompt: string,
  storyId?: string,
  sceneIndex?: number,
  aspectRatio?: number,
): Promise<string> {
  try {
    console.log("Calling API to generate image with prompt:", prompt)

    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        storyId,
        sceneIndex,
        aspectRatio: aspectRatio || 1.5, // Default to landscape for stories
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server responded with ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.imageData) {
      throw new Error(data.error || "Failed to generate image")
    }

    console.log("Image generation successful")

    // If we have a stored image URL, return that instead of creating a blob URL
    if (data.storedImageUrl) {
      return data.storedImageUrl
    }

    // Otherwise, convert base64 to blob and create URL
    const byteCharacters = atob(data.imageData.split(",")[1] || data.imageData)
    const byteArrays = []

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i))
    }

    const byteArray = new Uint8Array(byteArrays)
    const blob = new Blob([byteArray], { type: "image/png" })

    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("Error generating image:", error)

    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`)
    } else {
      throw new Error("Failed to generate image: Unknown error")
    }
  }
}

// Alias for backward compatibility
export const generateComic = generateImage

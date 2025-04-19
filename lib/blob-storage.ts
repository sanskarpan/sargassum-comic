import { put, list, del } from "@vercel/blob"

export async function uploadImageToBlob(imageData: string, storyId: string, sceneIndex: number): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.includes("base64,") ? imageData.split("base64,")[1] : imageData

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")

    // Create a unique filename
    const filename = `stories/${storyId}/scene-${sceneIndex}.png`

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false, // Use exact filename
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    throw new Error("Failed to upload image to storage")
  }
}

export async function deleteStoryImages(storyId: string): Promise<void> {
  try {
    // List all blobs for this story
    const { blobs } = await list({ prefix: `stories/${storyId}/` })

    // Delete each blob
    for (const blob of blobs) {
      await del(blob.url)
    }
  } catch (error) {
    console.error("Error deleting images from Vercel Blob:", error)
    throw new Error("Failed to delete images from storage")
  }
}

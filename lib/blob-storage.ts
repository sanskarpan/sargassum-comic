import { put, list, del } from "@vercel/blob"

export async function uploadImageToBlob(imageData: string, storyId: string, sceneIndex: number): Promise<string> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Missing BLOB_READ_WRITE_TOKEN environment variable");
      throw new Error("Missing required environment variables for image storage");
    }
    
    console.log(`Uploading image for story ${storyId}, scene ${sceneIndex} to Vercel Blob storage`);
    
    // Check if inputs are valid
    if (!imageData) {
      throw new Error("No image data provided");
    }
    
    if (!storyId) {
      throw new Error("No story ID provided");
    }
    
    // Remove data URL prefix if present
    const base64Data = imageData.includes("base64,") ? imageData.split("base64,")[1] : imageData;
    
    // Check if base64 data is valid
    if (!base64Data || base64Data.length < 100) {
      console.error("Invalid base64 data:", base64Data?.substring(0, 30) + "...");
      throw new Error("Invalid image data");
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, "base64");
      
      // Validate buffer
      if (buffer.length < 100) {
        throw new Error("Invalid image buffer (too small)");
      }
      
      // Create a unique filename
      const filename = `stories/${storyId}/scene-${sceneIndex}.png`;
      console.log(`Using filename: ${filename}`);
  
      // Upload to Vercel Blob
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: "image/png",
        addRandomSuffix: false, // Use exact filename
        allowOverwrite: true,   // Overwrite existing blob if present
      });
  
      if (!blob || !blob.url) {
        throw new Error("Failed to get URL from uploaded blob");
      }
      
      console.log(`Image uploaded successfully. URL: ${blob.url}`);
      return blob.url;
    } catch (bufferError: unknown) {
      console.error("Error processing image data:", bufferError);
      throw new Error(`Failed to process image data: ${bufferError instanceof Error ? bufferError.message : String(bufferError)}`);
    }
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // For serious errors, rethrow to be handled by the caller
    throw new Error(`Failed to upload image to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

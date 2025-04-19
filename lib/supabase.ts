import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type Comic = {
  id: string
  title: string | null
  initial_prompt: string
  created_at: string
  updated_at: string
}

export type Panel = {
  id: string
  comic_id: string
  prompt: string
  image_url: string
  sequence_number: number
  created_at: string
}

export type PromptHistory = {
  id: string
  prompt: string
  improved_prompt: string | null
  was_used: boolean
  created_at: string
}

export type StoryProgression = {
  id: string
  comic_id: string
  source_prompt: string
  generated_prompts: string[]
  created_at: string
}

// Create a single supabase client for server-side usage
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Create a singleton client for client-side usage
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSupabaseInstance = createClient(supabaseUrl, supabaseKey)
  return clientSupabaseInstance
}

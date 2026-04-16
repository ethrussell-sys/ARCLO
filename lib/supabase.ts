import { createClient } from '@supabase/supabase-js'

export type Film = {
  id: string
  title: string
  description: string | null
  director: string | null
  year: number | null
  price: number
  trailer_url: string | null
  file_key: string
  thumbnail_url: string | null
  created_at: string
}

export type Purchase = {
  id: string
  film_id: string
  email: string
  stripe_payment_id: string
  download_url: string | null
  expires_at: string | null
  created_at: string
}

export function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

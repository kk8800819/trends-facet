// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

// クライアントサイド用
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// サーバーサイド用（管理者権限）
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
)
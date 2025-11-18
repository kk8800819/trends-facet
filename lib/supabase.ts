// lib/supabase.ts（修正版）
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// クライアントサイド用
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// サーバーサイド用（管理者権限）
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
  : supabase // SERVICE_ROLE_KEYがない場合はanonキーを使用
// lib/types.ts（修正版）
export type Database = {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: number
          shopify_blog_id: number
          shopify_article_id: number
          title: string
          content: string | null
          excerpt: string | null
          author: string | null
          published_at: string | null
          url: string
          image_url: string | null
          languages: string[]
          hierarchies: string[]
          themes: string[]
          occupations: string[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>
      }
    }
  }
}

export type BlogArticle = Database['public']['Tables']['blogs']['Row']

export type FacetFilters = {
  languages?: string[]
  hierarchies?: string[]
  themes?: string[]
  occupations?: string[]
}

export type FacetCounts = {
  languages: { value: string; count: number }[]
  hierarchies: { value: string; count: number }[]
  themes: { value: string; count: number }[]
  occupations: { value: string; count: number }[]
}
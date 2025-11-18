// app/blogs/[[...filters]]/page.tsx（修正版）

import { generateStaticPatterns, isStaticPattern } from '@/lib/static-patterns'
import { supabase } from '@/lib/supabase'
import { StaticBlogList } from '@/components/StaticBlogList'
import { DynamicBlogList } from '@/components/DynamicBlogList'
import { BlogArticle, FacetFilters, FacetCounts } from '@/lib/types'

// 静的生成するパターンを定義
export async function generateStaticParams() {
  const patterns = generateStaticPatterns()
  
  return patterns.map(pattern => ({
    filters: pattern.length > 0 ? pattern : undefined,
  }))
}

// メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ filters?: string[] }>
}) {
  const { filters: rawFilters = [] } = await params
  const filters = rawFilters.map(f => decodeURIComponent(f))  // ← デコード追加
  const title = generatePageTitle(filters)
  const description = generatePageDescription(filters)
  
  return {
    title: `${title} | プログラミング学習ブログ`,
    description,
  }
}

export default async function BlogsPage({
  params,
}: {
  params: Promise<{ filters?: string[] }>
}) {
  const { filters: rawFilters = [] } = await params
  const filters = rawFilters.map(f => decodeURIComponent(f))
  
  console.log('デコード後のフィルター:', filters)
  
  const isStatic = isStaticPattern(filters)
  
  if (isStatic) {
    // SSG: 静的ページ
    const blogs = await fetchBlogsStatic(filters)
    const facetCounts = await calculateFacetCountsStatic(filters)
    
    return (
      <StaticBlogList 
        blogs={blogs}
        facetCounts={facetCounts}
        currentFilters={parseFilters(filters)}
      />
    )
  } else {
    // CSR: 動的ページ（JSONベース）
    return <DynamicBlogList initialFilters={filters} />  // ← 変更
  }
}

async function fetchBlogsStatic(filters: string[]): Promise<BlogArticle[]> {
  let query = supabase
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false })
  
  const conditions = parseFilters(filters)
  
  Object.entries(conditions).forEach(([category, values]) => {
    if (values && values.length > 0) {
      query = query.overlaps(category as any, values)
    }
  })
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
  
  return data || []
}

async function calculateFacetCountsStatic(currentFilters: string[]): Promise<FacetCounts> {
  const conditions = parseFilters(currentFilters)
  
  let query = supabase
    .from('blogs')
    .select('languages, hierarchies, themes, occupations')
  
  const { data: allBlogs } = await query
  
  if (!allBlogs) {
    return {
      languages: [],
      hierarchies: [],
      themes: [],
      occupations: []
    }
  }
  
  const counts: Record<string, Record<string, number>> = {
    languages: {},
    hierarchies: {},
    themes: {},
    occupations: {}
  }
  
  allBlogs.forEach(blog => {
    const matchesOther = Object.entries(conditions).every(([cat, vals]) => {
      if (!vals || vals.length === 0) return true
      return vals.some(v => (blog as any)[cat]?.includes(v))
    })
    
    if (matchesOther || Object.keys(conditions).length === 0) {
      ;['languages', 'hierarchies', 'themes', 'occupations'].forEach(category => {
        const values = (blog as any)[category] || []
        values.forEach((value: string) => {
          counts[category][value] = (counts[category][value] || 0) + 1
        })
      })
    }
  })
  
  const result: FacetCounts = {
    languages: [],
    hierarchies: [],
    themes: [],
    occupations: []
  }
  
  Object.entries(counts).forEach(([category, valueCounts]) => {
    result[category as keyof FacetCounts] = Object.entries(valueCounts)
      .map(([value, count]) => ({ value, count: count as number }))
      .sort((a, b) => b.count - a.count)
  })
  
  return result
}

function parseFilters(filters: string[]): FacetFilters {
  const result: FacetFilters = {}
  
  for (let i = 0; i < filters.length; i += 2) {
    const category = filters[i] as keyof FacetFilters
    const value = filters[i + 1]
    
    if (!result[category]) {
      result[category] = []
    }
    result[category]!.push(value)
  }
  
  return result
}

function generatePageTitle(filters: string[]): string {
  if (filters.length === 0) return 'すべての記事'
  
  const parsed = parseFilters(filters)
  const parts: string[] = []
  
  if (parsed.languages?.length) parts.push(parsed.languages.join(', '))
  if (parsed.themes?.length) parts.push(parsed.themes.join(', '))
  if (parsed.hierarchies?.length) parts.push(parsed.hierarchies.join(', '))
  if (parsed.occupations?.length) parts.push(parsed.occupations.join(', '))
  
  return parts.join(' × ')
}

function generatePageDescription(filters: string[]): string {
  const title = generatePageTitle(filters)
  return `${title}に関するプログラミング学習記事の一覧ページです。`
}
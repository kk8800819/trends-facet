// components/DynamicBlogList.tsx
'use client'

import { useEffect, useState } from 'react'
import { BlogCard } from './BlogCard'
import { FacetNavigation } from './FacetNavigation'
import { BlogArticle, FacetCounts, FacetFilters } from '@/lib/types'

type Props = {
  initialFilters: string[]
}

// 全データをキャッシュ（アプリ起動時に1回だけ読み込み）
let blogsCache: BlogArticle[] | null = null

export function DynamicBlogList({ initialFilters }: Props) {
  const [blogs, setBlogs] = useState<BlogArticle[]>([])
  const [facetCounts, setFacetCounts] = useState<FacetCounts>({
    languages: [],
    hierarchies: [],
    themes: [],
    occupations: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadAndFilterBlogs()
  }, [initialFilters])
  
  async function loadAndFilterBlogs() {
    setLoading(true)
    setError(null)
    
    try {
      // キャッシュがなければJSON読み込み（初回のみ）
      if (!blogsCache) {
        console.log('📥 JSONデータ読み込み中...')
        const response = await fetch('/data/blogs.json')
        
        if (!response.ok) {
          throw new Error('データの読み込みに失敗しました')
        }
        
        blogsCache = await response.json()
        console.log(`✓ ${blogsCache!.length}件のデータを読み込みました`)
      }
      
      // クライアントサイドでフィルタリング（超高速）
      const filtered = filterBlogs(blogsCache, initialFilters)
      setBlogs(filtered)
      
      // ファセットカウント計算
      const counts = calculateFacetCounts(blogsCache, initialFilters)
      setFacetCounts(counts)
      
    } catch (err) {
      console.error('データ読み込みエラー:', err)
      setError(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }
  
  function filterBlogs(allBlogs: BlogArticle[], filters: string[]): BlogArticle[] {
    if (filters.length === 0) return allBlogs
    
    // フィルター条件を解析
    const conditions: Record<string, string[]> = {}
    for (let i = 0; i < filters.length; i += 2) {
      const category = filters[i]
      const value = filters[i + 1]
      if (!conditions[category]) conditions[category] = []
      conditions[category].push(value)
    }
    
    // フィルタリング
    return allBlogs.filter(blog => {
      return Object.entries(conditions).every(([category, values]) => {
        const blogValues = (blog as any)[category] as string[] | undefined
        if (!blogValues) return false
        return values.some(value => blogValues.includes(value))
      })
    })
  }
  
  function calculateFacetCounts(allBlogs: BlogArticle[], currentFilters: string[]): FacetCounts {
    // 現在のフィルター条件を解析
    const conditions: Record<string, string[]> = {}
    for (let i = 0; i < currentFilters.length; i += 2) {
      const category = currentFilters[i]
      const value = currentFilters[i + 1]
      if (!conditions[category]) conditions[category] = []
      conditions[category].push(value)
    }
    
    const counts: Record<string, Record<string, number>> = {
      languages: {},
      hierarchies: {},
      themes: {},
      occupations: {}
    }
    
    // 各カテゴリのカウント
    allBlogs.forEach(blog => {
      // 他のフィルター条件にマッチするか確認
      const matchesOther = Object.entries(conditions).every(([cat, vals]) => {
        const blogValues = (blog as any)[cat] as string[] | undefined
        if (!blogValues) return false
        return vals.some(v => blogValues.includes(v))
      })
      
      if (matchesOther || Object.keys(conditions).length === 0) {
        ;['languages', 'hierarchies', 'themes', 'occupations'].forEach(category => {
          const values = (blog as any)[category] as string[] | undefined
          values?.forEach((value: string) => {
            counts[category][value] = (counts[category][value] || 0) + 1
          })
        })
      }
    })
    
    // 配列に変換してソート
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">検索中...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }
  
  const filterText = generateFilterText(initialFilters)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {filterText || 'すべての記事'}
      </h1>
      <p className="text-gray-600 mb-8">
        プログラミング学習に役立つ記事を検索できます
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ファセットナビゲーション */}
        <aside className="lg:col-span-1">
          <FacetNavigation 
            facets={facetCounts}
            currentFilters={parseFilters(initialFilters)}
          />
        </aside>
        
        {/* ブログ一覧 */}
        <main className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-gray-600">
              <span className="font-bold text-lg">{blogs.length}</span>件の記事
            </div>
            
            {/* 動的ページバッジ */}
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              クライアント検索（高速）
            </span>
          </div>
          
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">
                条件に一致する記事が見つかりませんでした
              </p>
              <button
                onClick={() => window.location.href = '/blogs/'}
                className="text-blue-600 hover:underline"
              >
                すべての記事を表示
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function parseFilters(filters: string[]): FacetFilters {
  const result: FacetFilters = {}
  for (let i = 0; i < filters.length; i += 2) {
    const category = filters[i] as keyof FacetFilters
    const value = filters[i + 1]
    if (!result[category]) result[category] = []
    result[category]!.push(value)
  }
  return result
}

function generateFilterText(filters: string[]): string {
  if (filters.length === 0) return ''
  
  const parsed = parseFilters(filters)
  const parts: string[] = []
  
  if (parsed.languages?.length) parts.push(parsed.languages.join(', '))
  if (parsed.themes?.length) parts.push(parsed.themes.join(', '))
  if (parsed.hierarchies?.length) parts.push(parsed.hierarchies.join(', '))
  if (parsed.occupations?.length) parts.push(parsed.occupations.join(', '))
  
  return parts.join(' × ')
}
// components/StaticBlogList.tsx
import { BlogArticle, FacetCounts, FacetFilters } from '@/lib/types'
import { BlogCard } from './BlogCard'
import { FacetNavigation } from './FacetNavigation'

type Props = {
  blogs: BlogArticle[]
  facetCounts: FacetCounts
  currentFilters: FacetFilters
}

export function StaticBlogList({ blogs, facetCounts, currentFilters }: Props) {
  // 選択中のフィルターを表示用テキストに変換
  const filterText = generateFilterText(currentFilters)
  
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
            currentFilters={currentFilters}
          />
        </aside>
        
        {/* ブログ一覧 */}
        <main className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-gray-600">
              <span className="font-bold text-lg">{blogs.length}</span>件の記事
            </div>
            
            {/* 静的ページバッジ */}
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              静的ページ（高速）
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
                onClick={() => window.location.href = '/blogs'}
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

function generateFilterText(filters: FacetFilters): string {
  const parts: string[] = []
  
  if (filters.languages?.length) {
    parts.push(filters.languages.join(', '))
  }
  if (filters.themes?.length) {
    parts.push(filters.themes.join(', '))
  }
  if (filters.hierarchies?.length) {
    parts.push(filters.hierarchies.join(', '))
  }
  if (filters.occupations?.length) {
    parts.push(filters.occupations.join(', '))
  }
  
  return parts.join(' × ')
}
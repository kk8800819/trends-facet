// components/FacetNavigation.tsx（修正版）
'use client'

import { FacetCounts, FacetFilters } from '@/lib/types'
import { useRouter, usePathname } from 'next/navigation'  // ← useSearchParams削除、usePathname追加
import { useState } from 'react'

type Props = {
  facets: FacetCounts
  currentFilters: FacetFilters
}

export function FacetNavigation({ facets, currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()  // ← 追加
  
  const toggleFilter = (category: keyof FacetFilters, value: string) => {
    // 現在のフィルターをコピー
    const newFilters = { ...currentFilters }
    
    // カテゴリが存在しない場合は初期化
    if (!newFilters[category]) {
      newFilters[category] = []
    }
    
    // 値の追加/削除
    if (newFilters[category]!.includes(value)) {
      // 削除
      newFilters[category] = newFilters[category]!.filter(v => v !== value)
      // 空になったカテゴリは削除
      if (newFilters[category]!.length === 0) {
        delete newFilters[category]
      }
    } else {
      // 追加
      newFilters[category] = [...newFilters[category]!, value]
    }
    
    // フィルターをURLパスに変換
    const filterPath = buildFilterPath(newFilters)
    router.push(filterPath)
  }
  
  const clearAll = () => {
    router.push('/blogs/')
  }
  
  const isActive = (category: keyof FacetFilters, value: string) => {
    return currentFilters[category]?.includes(value) || false
  }
  
  const hasActiveFilters = 
    (currentFilters.languages?.length || 0) +
    (currentFilters.hierarchies?.length || 0) +
    (currentFilters.themes?.length || 0) +
    (currentFilters.occupations?.length || 0) > 0
  
  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">絞り込み</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            クリア
          </button>
        )}
      </div>
      
      <FacetGroup
        title="言語"
        category="languages"
        items={facets.languages}
        isActive={isActive}
        onToggle={toggleFilter}
      />
      
      <FacetGroup
        title="対象者"
        category="hierarchies"
        items={facets.hierarchies}
        isActive={isActive}
        onToggle={toggleFilter}
      />
      
      <FacetGroup
        title="テーマ"
        category="themes"
        items={facets.themes}
        isActive={isActive}
        onToggle={toggleFilter}
      />
      
      <FacetGroup
        title="職種"
        category="occupations"
        items={facets.occupations}
        isActive={isActive}
        onToggle={toggleFilter}
      />
    </div>
  )
}

type FacetGroupProps = {
  title: string
  category: keyof FacetFilters
  items: { value: string; count: number }[]
  isActive: (category: keyof FacetFilters, value: string) => boolean
  onToggle: (category: keyof FacetFilters, value: string) => void
}

function FacetGroup({ title, category, items, isActive, onToggle }: FacetGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (items.length === 0) return null
  
  return (
    <div className="mb-6 pb-6 border-b last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full mb-3 font-semibold text-left hover:text-blue-600"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-xl">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {items.slice(0, 10).map(({ value, count }) => {
            const active = isActive(category, value)
            
            return (
              <label
                key={value}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggle(category, value)}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={`flex-1 text-sm ${active ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                  {value}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {count}
                </span>
              </label>
            )
          })}
          
          {items.length > 10 && (
            <button className="text-sm text-blue-600 hover:underline pl-2">
              さらに表示 ({items.length - 10}件)
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// URLパス生成ヘルパー（修正版）
function buildFilterPath(filters: FacetFilters): string {
  const parts: string[] = []
  
  // カテゴリの順序を固定（URLの一貫性のため）
  const categories: (keyof FacetFilters)[] = ['languages', 'hierarchies', 'themes', 'occupations']
  
  categories.forEach(category => {
    const values = filters[category]
    if (values && values.length > 0) {
      values.forEach(value => {
        parts.push(category, value)
      })
    }
  })
  
  return parts.length > 0 ? `/blogs/${parts.join('/')}` : '/blogs/'
}
// lib/static-patterns.ts（修正版）

// マスターデータ定義（変更なし）
export const FACET_MASTER = {
  languages: [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
  ],
  hierarchies: [
    '新入社員',
    '新卒社員',
    '中途社員',
    '内定者',
  ],
  themes: [
    'DX',
    'AI',
    'ITリテラシー',
    '業務効率化',
    'クラウド',
    'セキュリティ',
    'データ分析',
    'Web開発',
  ],
  occupations: [
    'デザイナー',
    'プログラマー',
    'SE',
    'マーケター',
    'PM',
    'データサイエンティスト',
  ],
}

// 静的生成するパターン（変更なし）
export function generateStaticPatterns(): string[][] {
  const patterns: string[][] = []
  
  patterns.push([])
  
  Object.entries(FACET_MASTER).forEach(([category, values]) => {
    values.forEach(value => {
      patterns.push([category, value])
    })
  })
  
  const popularLanguages = ['JavaScript', 'Python', 'TypeScript', 'Java', 'PHP']
  const popularThemes = ['DX', 'AI', '業務効率化', 'Web開発']
  
  popularLanguages.forEach(lang => {
    popularThemes.forEach(theme => {
      patterns.push(['languages', lang, 'themes', theme])
    })
  })
  
  console.log(`生成パターン数: ${patterns.length}`)
  return patterns
}

// 静的パターンのSet（変更なし）
export function generateStaticPatternsSet(): Set<string> {
  const patterns = generateStaticPatterns()
  return new Set(patterns.map(p => p.join('/')))
}

// パターンが静的生成されているか確認（デバッグログ追加）
export function isStaticPattern(filters: string[]): boolean {
  // filtersはすでにデコードされた状態で渡される
  const path = filters.join('/')
  const staticSet = generateStaticPatternsSet()
  const result = staticSet.has(path)
  
  // デバッグ用
  console.log('チェック中のパス:', path)
  console.log('静的パターンに含まれる?:', result)
  console.log('生成されたパターン（最初の10個）:', Array.from(staticSet).slice(0, 10))
  
  return result
}
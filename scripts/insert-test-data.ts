// scripts/insert-test-data.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local を読み込む
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const testBlogs = [
  {
    shopify_blog_id: 1,
    shopify_article_id: 1001,
    title: 'JavaScriptの基礎を学ぼう',
    content: 'JavaScriptの基本的な文法について解説します...',
    excerpt: 'JavaScriptの基本を初心者向けに解説',
    author: '山田太郎',
    published_at: '2024-01-15T10:00:00Z',
    url: 'https://example.com/blogs/javascript-basics',
    image_url: 'https://via.placeholder.com/800x400',
    languages: ['JavaScript'],
    hierarchies: ['新入社員'],
    themes: ['Web開発', 'ITリテラシー'],
    occupations: ['プログラマー'],
    tags: ['言語:JavaScript', '階層:新入社員', 'テーマ:Web開発'],
  },
  {
    shopify_blog_id: 1,
    shopify_article_id: 1002,
    title: 'PythonでAI開発入門',
    content: 'Pythonを使ったAI開発の始め方...',
    excerpt: 'PythonでAI開発を始めるための基礎知識',
    author: '佐藤花子',
    published_at: '2024-01-20T10:00:00Z',
    url: 'https://example.com/blogs/python-ai',
    image_url: 'https://via.placeholder.com/800x400',
    languages: ['Python'],
    hierarchies: ['新入社員', '中途社員'],
    themes: ['AI', 'データ分析'],
    occupations: ['データサイエンティスト', 'プログラマー'],
    tags: ['言語:Python', 'テーマ:AI'],
  },
  {
    shopify_blog_id: 1,
    shopify_article_id: 1003,
    title: 'DX推進のためのTypeScript活用術',
    content: 'TypeScriptを使ったDX推進の実践例...',
    excerpt: 'TypeScriptでDXを推進する方法',
    author: '鈴木一郎',
    published_at: '2024-01-25T10:00:00Z',
    url: 'https://example.com/blogs/typescript-dx',
    image_url: 'https://via.placeholder.com/800x400',
    languages: ['TypeScript', 'JavaScript'],
    hierarchies: ['中途社員'],
    themes: ['DX', '業務効率化'],
    occupations: ['SE', 'PM'],
    tags: ['言語:TypeScript', 'テーマ:DX'],
  },
  {
    shopify_blog_id: 1,
    shopify_article_id: 1004,
    title: 'HTMLとCSSでWebデザイン',
    content: 'HTMLとCSSの基礎からレスポンシブデザインまで...',
    excerpt: 'WebデザインのためのHTMLとCSS入門',
    author: '田中美咲',
    published_at: '2024-02-01T10:00:00Z',
    url: 'https://example.com/blogs/html-css-design',
    image_url: 'https://via.placeholder.com/800x400',
    languages: ['HTML', 'CSS'],
    hierarchies: ['新入社員', '新卒社員'],
    themes: ['Web開発'],
    occupations: ['デザイナー', 'プログラマー'],
    tags: ['言語:HTML', '言語:CSS', 'テーマ:Web開発'],
  },
  {
    shopify_blog_id: 1,
    shopify_article_id: 1005,
    title: 'JavaでWebアプリケーション開発',
    content: 'Javaを使ったWebアプリケーション開発の基礎...',
    excerpt: 'Java入門からWebアプリまで',
    author: '高橋健太',
    published_at: '2024-02-05T10:00:00Z',
    url: 'https://example.com/blogs/java-webapp',
    image_url: 'https://via.placeholder.com/800x400',
    languages: ['Java'],
    hierarchies: ['新入社員', '中途社員'],
    themes: ['Web開発', '業務効率化'],
    occupations: ['プログラマー', 'SE'],
    tags: ['言語:Java', 'テーマ:Web開発'],
  },
]

async function insertTestData() {
  console.log('🚀 テストデータを投入中...')
  
  const { data, error } = await supabase
    .from('blogs')
    .insert(testBlogs)
    .select()
  
  if (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  }
  
  console.log(`✅ ${data.length}件のテストデータを投入しました`)
  console.log(data)
}

insertTestData()
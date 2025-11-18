// scripts/generate-blogs-json.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// .env.local を読み込む
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function generateBlogsJson() {
  console.log('🚀 全ブログデータを取得中...')
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false })
  
  if (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  }
  
  console.log(`✓ ${blogs?.length || 0}件のデータを取得`)
  
  if (!blogs || blogs.length === 0) {
    console.warn('⚠️ データが0件です')
    return
  }
  
  // 軽量化（contentフィールドを除外）
  const lightweightBlogs = blogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    url: blog.url,
    image_url: blog.image_url,
    author: blog.author,
    published_at: blog.published_at,
    languages: blog.languages,
    hierarchies: blog.hierarchies,
    themes: blog.themes,
    occupations: blog.occupations,
    tags: blog.tags,
  }))
  
  // publicディレクトリ作成
  const dataDir = path.join(process.cwd(), 'public', 'data')
  await fs.mkdir(dataDir, { recursive: true })
  
  // blogs.json保存
  const blogsPath = path.join(dataDir, 'blogs.json')
  await fs.writeFile(
    blogsPath,
    JSON.stringify(lightweightBlogs, null, 0),  // minify
    'utf-8'
  )
  
  const fileSize = (await fs.stat(blogsPath)).size
  console.log(`✓ blogs.json 生成: ${(fileSize / 1024).toFixed(2)} KB`)
  
  // ファセットマスターデータ生成
  const facets = {
    languages: [...new Set(blogs.flatMap(b => b.languages || []))].sort(),
    hierarchies: [...new Set(blogs.flatMap(b => b.hierarchies || []))].sort(),
    themes: [...new Set(blogs.flatMap(b => b.themes || []))].sort(),
    occupations: [...new Set(blogs.flatMap(b => b.occupations || []))].sort(),
  }
  
  const facetsPath = path.join(dataDir, 'facets.json')
  await fs.writeFile(
    facetsPath,
    JSON.stringify(facets, null, 2),
    'utf-8'
  )
  
  console.log('✓ facets.json 生成')
  console.log('\n📊 統計:')
  console.log(`  - 記事数: ${blogs.length}件`)
  console.log(`  - 言語: ${facets.languages.length}種類`)
  console.log(`  - 階層: ${facets.hierarchies.length}種類`)
  console.log(`  - テーマ: ${facets.themes.length}種類`)
  console.log(`  - 職種: ${facets.occupations.length}種類`)
  console.log('\n✅ JSON生成完了！')
}

generateBlogsJson().catch(console.error)
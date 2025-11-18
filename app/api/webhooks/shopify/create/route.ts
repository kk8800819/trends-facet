// app/api/webhooks/shopify/blogs/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Webhook署名検証
    const isValid = await verifyWebhook(request)
    if (!isValid) {
      console.error('❌ Webhook署名が無効です')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const article = await request.json()
    
    console.log('📝 新しい記事を受信:', article.title)
    
    // Shopifyのタグをパース
    const tags = article.tags ? article.tags.split(', ') : []
    
    const blogData = {
      shopify_blog_id: article.blog_id,
      shopify_article_id: article.id,
      title: article.title,
      content: article.body_html || null,
      excerpt: article.summary_html || null,
      author: article.author || 'Unknown',
      published_at: article.published_at,
      url: `https://${process.env.SHOPIFY_STORE_DOMAIN}/blogs/${article.handle}`,
      image_url: article.image?.src || null,
      languages: extractTagsByPrefix(tags, '言語'),
      hierarchies: extractTagsByPrefix(tags, '階層'),
      themes: extractTagsByPrefix(tags, 'テーマ'),
      occupations: extractTagsByPrefix(tags, '職種'),
      tags: tags,
    }
    
    const { error } = await supabaseAdmin
      .from('blogs')
      .upsert(blogData, { onConflict: 'shopify_article_id' })
    
    if (error) {
      console.error('❌ Supabase保存エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ 記事を保存しました:', article.title)
    return NextResponse.json({ success: true, title: article.title })
    
  } catch (error) {
    console.error('❌ Webhookエラー:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// タグから特定のプレフィックスの値を抽出
function extractTagsByPrefix(tags: string[], prefix: string): string[] {
  return tags
    .filter(tag => tag.startsWith(`${prefix}:`))
    .map(tag => tag.replace(`${prefix}:`, '').trim())
}

// Webhook署名検証
async function verifyWebhook(request: NextRequest): Promise<boolean> {
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  
  if (!hmac) {
    console.error('❌ HMACヘッダーがありません')
    return false
  }
  
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    console.error('❌ SHOPIFY_WEBHOOK_SECRETが設定されていません')
    return false
  }
  
  // リクエストボディを取得（署名検証用）
  const body = await request.text()
  
  // HMAC-SHA256で署名を生成
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64')
  
  const isValid = hash === hmac
  
  if (!isValid) {
    console.error('❌ 署名が一致しません')
    console.error('期待値:', hash)
    console.error('実際値:', hmac)
  }
  
  return isValid
}
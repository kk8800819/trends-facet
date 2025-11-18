// app/api/webhooks/shopify/blogs/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const isValid = await verifyWebhook(request)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const article = await request.json()
    
    console.log('📝 記事を更新:', article.title)
    
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
    
    console.log('✅ 記事を更新しました:', article.title)
    return NextResponse.json({ success: true, title: article.title })
    
  } catch (error) {
    console.error('❌ Webhookエラー:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function extractTagsByPrefix(tags: string[], prefix: string): string[] {
  return tags
    .filter(tag => tag.startsWith(`${prefix}:`))
    .map(tag => tag.replace(`${prefix}:`, '').trim())
}

async function verifyWebhook(request: NextRequest): Promise<boolean> {
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  
  if (!hmac || !process.env.SHOPIFY_WEBHOOK_SECRET) {
    return false
  }
  
  const body = await request.text()
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmac
}
// app/api/webhooks/shopify/blogs/delete/route.ts
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
    
    console.log('🗑️ 記事を削除:', article.id)
    
    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('shopify_article_id', article.id)
    
    if (error) {
      console.error('❌ Supabase削除エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ 記事を削除しました:', article.id)
    return NextResponse.json({ success: true, id: article.id })
    
  } catch (error) {
    console.error('❌ Webhookエラー:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
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
// components/BlogCard.tsx
import { BlogArticle } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  blog: BlogArticle
}

export function BlogCard({ blog }: Props) {
  const formattedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''
  
  return (
    <article className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
      {blog.image_url && (
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 line-clamp-2 hover:text-blue-600">
          <Link href={blog.url} target="_blank" rel="noopener noreferrer">
            {blog.title}
          </Link>
        </h3>
        
        {blog.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        
        {/* タグ表示 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {lang}
            </span>
          ))}
          {blog.themes.slice(0, 2).map((theme) => (
            <span
              key={theme}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
        
        {/* メタ情報 */}
        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
          <span>{blog.author}</span>
          <time dateTime={blog.published_at || ''}>{formattedDate}</time>
        </div>
      </div>
    </article>
  )
}
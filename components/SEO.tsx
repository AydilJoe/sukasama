'use client'

import { usePathname } from 'next/navigation'
import Head from 'next/head'

interface SEOProps {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  ogType?: string
}

export default function SEO({ 
  title, 
  description, 
  keywords, 
  ogImage = 'https://www.suka-sama-suka.com/default-og-image.jpg',
  ogType = 'website'
}: SEOProps) {
  const pathname = usePathname()
  const canonicalUrl = `https://www.suka-sama-suka.com${pathname}`

  return (
    <Head>
      <title>{title} | SukaSamaSuka</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SukaSamaSuka",
            "url": "https://www.suka-sama-suka.com",
            "description": "Job matching platform for Malaysian civil servants",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.suka-sama-suka.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </Head>
  )
}
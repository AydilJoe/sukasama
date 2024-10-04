import Head from 'next/head'

interface JobPostingSchemaProps {
  title: string
  description: string
  datePosted: string
  validThrough: string
  employmentType: string
  hiringOrganization: string
  jobLocation: string
}

export default function JobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
}: JobPostingSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": title,
    "description": description,
    "datePosted": datePosted,
    "validThrough": validThrough,
    "employmentType": employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": hiringOrganization,
      "sameAs": "https://www.suka-sama-suka.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "MY",
        "addressRegion": jobLocation
      }
    }
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  )
}
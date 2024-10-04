import Auth from '@/components/Auth'
import SEO from '@/components/SEO'

export default function AuthPage() {
  return (
    <>
      <SEO 
        title="Authentication - SukaSamaSuka"
        description="Sign in or create an account for SukaSamaSuka, the job matching platform for Malaysian civil servants."
        keywords={['login', 'sign up', 'authentication', 'Malaysian civil servants', 'job matching', 'SukaSamaSuka']}
      />
      <Auth />
    </>
  )
}
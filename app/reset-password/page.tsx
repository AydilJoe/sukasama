import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'
import { Box, Spinner } from '@chakra-ui/react'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Spinner size="xl" /></Box>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
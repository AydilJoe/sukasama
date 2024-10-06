import { Suspense } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Spinner size="xl" /></Box>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
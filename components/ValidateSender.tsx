import { useState } from 'react'
import { 
  Button, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  VStack,
  Box
} from '@chakra-ui/react'

export default function ValidateSender() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleValidate = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/validate-sender', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to validate sender')
      }
      setStatus('success')
    } catch (error) {
      console.error('Error validating sender:', error)
      setStatus('error')
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Button 
        onClick={handleValidate} 
        isLoading={status === 'loading'}
        loadingText="Validating..."
        colorScheme="blue"
      >
        Validate Sender
      </Button>
      {status === 'success' && (
        <Alert status="success">
          <AlertIcon />
          <Box>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Sender validated successfully!</AlertDescription>
          </Box>
        </Alert>
      )}
      {status === 'error' && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to validate sender. Please try again.</AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  )
}
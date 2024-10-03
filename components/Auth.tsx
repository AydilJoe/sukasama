'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading } from '@chakra-ui/react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <form onSubmit={handleLogin}>
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl">Sign In</Heading>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Loading..."
            colorScheme="blue"
          >
            Send magic link
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
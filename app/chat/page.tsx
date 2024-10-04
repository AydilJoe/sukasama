'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import JobPostForm from '@/components/JobPostForm'
import JobPostsList from '@/components/JobPostsList'
import LogoutButton from '@/components/LogoutButton'
import { Box, Container, Heading, VStack, HStack, useColorModeValue, Text } from '@chakra-ui/react'
import { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const cardBgColor = useColorModeValue('white', 'gray.700')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handlePostCreated = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1)
  }, [])

  return (
    <Box minHeight="100vh" bg={bgColor} color={textColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack align="flex-start" spacing={0}>
              <Heading as="h1" size="2xl" color="blue.500">
                SukaSamaSuka
              </Heading>
              <Text fontSize="xl" fontWeight="medium" color="gray.500">
                Petukaran suka sama suka.
              </Text>
            </VStack>
            {session && <LogoutButton />}
          </HStack>
          {!session ? (
            <Auth />
          ) : (
            <Box>
              <Box
                bg={cardBgColor}
                borderRadius="lg"
                boxShadow="md"
                p={6}
                mb={8}
              >
                <JobPostForm onPostCreated={handlePostCreated} />
              </Box>
              <Box
                bg={cardBgColor}
                borderRadius="lg"
                boxShadow="md"
                p={6}
              >
                <JobPostsList key={refreshKey} />
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
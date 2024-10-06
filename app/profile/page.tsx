'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Avatar,
  Spinner,
  useToast,
  Container,
} from '@chakra-ui/react'

interface Profile {
  id: string
  full_name: string
  email: string
  phone_number: string
  avatar_url: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const toast = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No user found')

      let { data, error, status } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, avatar_url')
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error fetching profile',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    )
  }

  if (!profile) {
    return (
      <Container centerContent>
        <Text>No profile found. Please create a profile.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          User Profile
        </Heading>
        <Box textAlign="center">
          <Avatar size="2xl" name={profile.full_name} src={profile.avatar_url} mb={4} />
        </Box>
        <VStack spacing={3} align="start" bg="gray.50" p={6} borderRadius="md">
          <Text><strong>Name:</strong> {profile.full_name}</Text>
          <Text><strong>Email:</strong> {profile.email}</Text>
          <Text><strong>Phone:</strong> {profile.phone_number || 'Not provided'}</Text>
        </VStack>
        <Button 
          colorScheme="blue" 
          onClick={() => router.push('/profile/edit')}
        >
          Edit Profile
        </Button>
      </VStack>
    </Container>
  )
}
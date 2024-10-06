'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Skeleton,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react'
import { Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  full_name: string
  email: string
  phone_number: string
}

export default function UserProfile({ session }: { session: Session | null }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  const [phoneError, setPhoneError] = useState('')
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headingColor = useColorModeValue('blue.600', 'blue.300')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number')
        .eq('id', session?.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setEditedProfile(data)
      } else {
        const emptyProfile = {
          id: session?.user.id || '',
          full_name: '',
          email: session?.user.email || '',
          phone_number: ''
        }
        setProfile(emptyProfile)
        setEditedProfile(emptyProfile)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error fetching profile',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session, fetchProfile])

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(\+?6?01)[02-46-9]-*[0-9]{7}$|^(\+?6?01)[1]-*[0-9]{8}$/
    if (!phone) {
      setPhoneError('Phone number is required')
      return false
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number format')
      return false
    }
    setPhoneError('')
    return true
  }

  const updateProfile = async () => {
    if (!editedProfile) return

    if (!validatePhoneNumber(editedProfile.phone_number)) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user.id,
          full_name: editedProfile.full_name,
          email: editedProfile.email,
          phone_number: editedProfile.phone_number
        })

      if (error) {
        throw error
      }

      setProfile(editedProfile)
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error updating profile',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (isLoading) {
    return <Skeleton height="200px" />
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={6}
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ boxShadow: 'lg' }}
    >
      <VStack align="stretch" spacing={4}>
        <Heading as="h3" size="md" color={headingColor}>
        {profile && !isEditing 
    ? `Hi ${profile.full_name || 'there'}!` 
    : (profile ? 'Edit Profile' : 'Create Profile')}
        </Heading>
        {isEditing ? (
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input
                value={editedProfile?.full_name || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile!, full_name: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Text fontWeight="bold" color={textColor}>
              {editedProfile?.email || ''}
            </Text>
             
            </FormControl>
            <FormControl isInvalid={!!phoneError}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={editedProfile?.phone_number || ''}
                onChange={(e) => {
                  setEditedProfile({ ...editedProfile!, phone_number: e.target.value })
                  validatePhoneNumber(e.target.value)
                }}
                placeholder="e.g., 601234567890"
              />
              <FormErrorMessage>{phoneError}</FormErrorMessage>
            </FormControl>
            <Button onClick={updateProfile} colorScheme="blue" isDisabled={!!phoneError}>
              {profile ? 'Save Changes' : 'Create Profile'}
            </Button>
            {profile && (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            )}
          </VStack>
        ) : (
          <>
            
            <Text color={textColor}>Email: {profile?.email}</Text>
            <Text color={textColor}>Phone Number : {profile?.phone_number}</Text>
            <Button onClick={() => setIsEditing(true)} colorScheme="blue">
              Edit Profile
            </Button>
          </>
        )}
      </VStack>
    </Box>
  )
}
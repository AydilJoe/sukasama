import React, { useState, useEffect, useCallback } from 'react'
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Button, 
  useColorModeValue, 
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface JobPost {
  id: string
  user_id: string
  job_name: string
  job_grade: string
  current_location: string
  expected_location: string
}

interface ThreeWayMatch {
  posts: [JobPost, JobPost, JobPost]
}

export default function ThreeWayMatcher() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [matches, setMatches] = useState<ThreeWayMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const fetchJobPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
      
      if (error) throw error

      setJobPosts(data || [])
    } catch (err) {
      setError('Failed to fetch job posts. Please try again later.')
      console.error('Error fetching job posts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobPosts()
  }, [fetchJobPosts])

  const findThreeWayMatches = useCallback((posts: JobPost[]): ThreeWayMatch[] => {
    const matches: ThreeWayMatch[] = []
    const n = posts.length

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          const [a, b, c] = [posts[i], posts[j], posts[k]]
          
          if (
            a.expected_location === b.current_location &&
            b.expected_location === c.current_location &&
            c.expected_location === a.current_location &&
            a.job_name === b.job_name && b.job_name === c.job_name &&
            a.job_grade === b.job_grade && b.job_grade === c.job_grade &&
            a.user_id !== b.user_id && b.user_id !== c.user_id && c.user_id !== a.user_id
          ) {
            matches.push({ posts: [a, b, c] })
          }
        }
      }
    }

    return matches
  }, [])

  useEffect(() => {
    if (jobPosts.length > 0) {
      const threeWayMatches = findThreeWayMatches(jobPosts)
      setMatches(threeWayMatches)
    }
  }, [jobPosts, findThreeWayMatches])

  const handleRefresh = () => {
    fetchJobPosts()
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading job posts...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Box>
      <HStack justifyContent="space-between" mb={6}>
        <Heading as="h2" size="xl">Three-Way Matches</Heading>
        <Button onClick={handleRefresh} colorScheme="blue">Refresh</Button>
      </HStack>
      
      {matches.length === 0 ? (
        <Text>No three-way matches found.</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {matches.map((match, index) => (
            <Box 
              key={index}
              borderWidth={1}
              borderRadius="lg"
              p={6}
              bg={bgColor}
              borderColor={borderColor}
              boxShadow="md"
            >
              <Heading as="h3" size="md" mb={4}>Match #{index + 1}</Heading>
              {match.posts.map((post, postIndex) => (
                <VStack key={post.id} align="stretch" mb={4} spacing={2}>
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold">User {postIndex + 1}</Text>
                    <Badge colorScheme="blue">{post.job_name} - {post.job_grade}</Badge>
                  </HStack>
                  <Text>Current Location: {post.current_location}</Text>
                  <Text>Expected Location: {post.expected_location}</Text>
                </VStack>
              ))}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}

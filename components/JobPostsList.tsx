'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Badge, 
  SimpleGrid, 
  Divider, 
  useColorModeValue, 
  Button, 
  HStack, 
  Flex, 
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Spinner,
  Link,
  Container,
  Icon,
  Stack,
  IconButton,
} from '@chakra-ui/react'
import { ExternalLinkIcon, RepeatIcon, PhoneIcon, CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { FaMapMarkerAlt } from 'react-icons/fa'

interface JobPost {
  id: string
  job_name: string
  job_grade: string
  current_location: string
  expected_location: string
  created_at: string
  user_id: string
}

interface ConnectRequest {
  id: string
  sender_id: string
  receiver_id: string
  sender_phone: string
  receiver_phone: string | null
  status: 'pending' | 'accepted'
}

interface MultiWayMatch {
  participants: string[]
  jobPosts: JobPost[]
  connectRequests: ConnectRequest[]
}

export default function JobPostsList() {
  const [allJobPosts, setAllJobPosts] = useState<JobPost[]>([])
  const [userJobPosts, setUserJobPosts] = useState<JobPost[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectRequests, setConnectRequests] = useState<ConnectRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMatchUserId, setSelectedMatchUserId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [multiWayMatches, setMultiWayMatches] = useState<MultiWayMatch[]>([])
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headingColor = useColorModeValue('blue.600', 'blue.300')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const cardBgColor = useColorModeValue('gray.50', 'gray.700')

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }, [])

  const fetchAllJobPosts = useCallback(async () => {
    if (!currentUserId) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setAllJobPosts(data || [])
      setUserJobPosts(data.filter(post => post.user_id === currentUserId) || [])
    } catch (error) {
      console.error('Error fetching job posts:', error)
      toast({
        title: 'Error fetching job posts',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, toast])

  const fetchConnectRequests = useCallback(async () => {
    if (!currentUserId) return

    try {
      const { data, error } = await supabase
        .from('connect_requests')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)

      if (error) {
        throw error
      }

      setConnectRequests(data || [])
    } catch (error) {
      console.error('Error fetching connect requests:', error)
      toast({
        title: 'Error fetching connect requests',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [currentUserId, toast])

  const findMatches = useCallback((currentPost: JobPost, allPosts: JobPost[]) => {
    const [currentState, currentDistrict] = currentPost.current_location.split(', ')
    const [expectedState, expectedDistrict] = currentPost.expected_location.split(', ')

    const exactMatches = allPosts.filter(post => 
      post.current_location === currentPost.expected_location &&
      post.expected_location === currentPost.current_location &&
      post.job_name === currentPost.job_name &&
      post.job_grade === currentPost.job_grade &&
      post.user_id !== currentPost.user_id
    )

    const partialMatchesStateJob = allPosts.filter(post => {
      const [postCurrentState] = post.current_location.split(', ')
      const [postExpectedState] = post.expected_location.split(', ')
      return postCurrentState === expectedState &&
             postExpectedState === currentState &&
             post.job_name === currentPost.job_name &&
             post.user_id !== currentPost.user_id
    })

    const partialMatchesStateDistrictJob = allPosts.filter(post => {
      const [postCurrentState, postCurrentDistrict] = post.current_location.split(', ')
      const [postExpectedState, postExpectedDistrict] = post.expected_location.split(', ')
      return postCurrentState === expectedState &&
             postExpectedState === currentState &&
             post.job_name === currentPost.job_name &&
             (postCurrentDistrict === expectedDistrict || postExpectedDistrict === currentDistrict) &&
             post.user_id !== currentPost.user_id
    })

    return {
      exactMatches,
      partialMatchesStateJob,
      partialMatchesStateDistrictJob
    }
  }, [])

  const findMultiWayMatches = useCallback(() => {
    const matches: MultiWayMatch[] = []

    for (const post of allJobPosts) {
      const { exactMatches } = findMatches(post, allJobPosts)
      
      for (const match of exactMatches) {
        const existingMatch = matches.find(m => 
          m.participants.includes(post.user_id) && 
          m.participants.includes(match.user_id)
        )

        if (existingMatch) {
          if (!existingMatch.participants.includes(post.user_id)) {
            existingMatch.participants.push(post.user_id)
            existingMatch.jobPosts.push(post)
          }
          if (!existingMatch.participants.includes(match.user_id)) {
            existingMatch.participants.push(match.user_id)
            existingMatch.jobPosts.push(match)
          }
        } else {
          matches.push({
            participants: [post.user_id, match.user_id],
            jobPosts: [post, match],
            connectRequests: []
          })
        }
      }
    }

    const multiWayMatches = matches.filter(match => match.participants.length >= 3)

    for (const match of multiWayMatches) {
      match.connectRequests = connectRequests.filter(request => 
        match.participants.includes(request.sender_id) && 
        match.participants.includes(request.receiver_id)
      )
    }

    setMultiWayMatches(multiWayMatches)
  }, [allJobPosts, connectRequests, findMatches])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (currentUserId) {
      fetchAllJobPosts()
      fetchConnectRequests()
    }
  }, [currentUserId, fetchAllJobPosts, fetchConnectRequests])

  useEffect(() => {
    if (allJobPosts.length > 0 && connectRequests.length > 0) {
      findMultiWayMatches()
    }
  }, [allJobPosts, connectRequests, findMultiWayMatches])

  const handleConnectRequest = useCallback((matchUserId: string) => {
    setSelectedMatchUserId(matchUserId)
    setIsModalOpen(true)
  }, [])

  const submitConnectRequest = useCallback(async () => {
    if (!currentUserId || !selectedMatchUserId) return

    const phoneRegex = /^(\+?6?01)[02-46-9]-*[0-9]{7}$|^(\+?6?01)[1]-*[0-9]{8}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid Malaysian phone number.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const existingRequest = connectRequests.find(
      request => 
        (request.sender_id === currentUserId && request.receiver_id === selectedMatchUserId) ||
        (request.sender_id === selectedMatchUserId && request.receiver_id === currentUserId)
    )

    try {
      if (existingRequest) {
        if (existingRequest.sender_id === currentUserId) {
          toast({
            title: 'Request already sent',
            description: 'You have already sent a connect request to this user.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
        } else if (existingRequest.receiver_id === currentUserId && !existingRequest.receiver_phone) {
          const { error } = await supabase
            .from('connect_requests')
            .update({ receiver_phone: phoneNumber, status: 'accepted' })
            .eq('id', existingRequest.id)

          if (error) throw error

          toast({
            title: 'Connect request accepted',
            description: "You can now see each other's contact information.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        }
      } else {
        const { error } = await supabase
          .from('connect_requests')
          .insert({
            sender_id: currentUserId,
            receiver_id: selectedMatchUserId,
            sender_phone: phoneNumber,
            status: 'pending'
          })

        if (error) throw error

        toast({
          title: 'Connect request sent',
          description: 'Your connect request has been sent successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }

      await fetchConnectRequests()
    } catch (error) {
      console.error('Error handling connect request:', error)
      toast({
        title: 'Error',
        description: 'Failed to process the connect request. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    setIsModalOpen(false)
    setPhoneNumber('')
  }, [currentUserId, selectedMatchUserId, phoneNumber, connectRequests, toast, fetchConnectRequests])

  const getConnectRequestStatus = useCallback((matchUserId: string) => {
    const request = connectRequests.find(
      req => (req.sender_id === currentUserId && req.receiver_id === matchUserId) ||
             (req.sender_id === matchUserId && req.receiver_id === currentUserId)
    )

    if (!request) return null

    if (request.status === 'accepted') {
      return request.sender_id === currentUserId ? request.receiver_phone : request.sender_phone
    }

    return request.sender_id === currentUserId ? 'Pending' : 'Respond'
  }, [connectRequests, currentUserId])

  const renderConnectButton = useCallback((matchUserId: string) => {
    const status = getConnectRequestStatus(matchUserId)
    if (status === 'Pending') {
      return <Badge colorScheme="yellow">Pending</Badge>
    } else if (status === 'Respond') {
      return (
        <Button 
          onClick={() => handleConnectRequest(matchUserId)}
          colorScheme="green" 
          size="sm"
          leftIcon={<CheckIcon />}
        >
          Respond
        </Button>
      )
    } else if (status) {
      return (
        <Button
          as={Link}
          href={`tel:${status}`}
          colorScheme="blue"
          size="sm"
          leftIcon={<PhoneIcon />}
        >
          {status}
        </Button>
      )
    } else {
      return (
        <Button 
          onClick={() => handleConnectRequest(matchUserId)}
          colorScheme="blue" 
          size="sm"
          leftIcon={<PhoneIcon />}
        >
          Connect
        </Button>
      )
    }
  }, [getConnectRequestStatus, handleConnectRequest])

  const renderMatchSection = useCallback((title: string, matches: JobPost[]) => {
    if (matches.length === 0) return null
    return (
      <Box>
        <Text fontWeight="bold" mb={2}>{title}: {matches.length}</Text>
        <VStack align="stretch" spacing={2}>
          {matches.map(match => (
            <HStack key={match.id} justifyContent="space-between" p={2} bg={cardBgColor} borderRadius="md">
              <Text fontSize="sm">{match.job_name} - {match.job_grade}</Text>
              {renderConnectButton(match.user_id)}
            </HStack>
          ))}
        </VStack>
      </Box>
    )
  }, [renderConnectButton, cardBgColor])

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      toast({
        title: 'Post deleted',
        description: 'Your job post has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Refresh the job posts
      fetchAllJobPosts()
    } catch (error) {
      console.error('Error deleting job post:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete the job post. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [supabase, toast, fetchAllJobPosts])

  const renderJobPost = useCallback((post: JobPost) => {
    const matches = findMatches(post, allJobPosts)
    return (
      <Box 
        key={post.id} 
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
          <HStack justifyContent="space-between">
            <Heading as="h3" size="md" color={headingColor}>{post.job_name}</Heading>
            <HStack>
              <Badge colorScheme="blue" fontSize="0.8em" p={1}>{post.job_grade}</Badge>
              <IconButton
                aria-label="Delete post"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                onClick={() => handleDeletePost(post.id)}
              />
            </HStack>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontWeight="bold" color={textColor}><Icon as={FaMapMarkerAlt} mr={2} />Current Location:</Text>
              <Text>{post.current_location}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color={textColor}><Icon as={FaMapMarkerAlt} mr={2} />Expected Location:</Text>
              <Text>{post.expected_location}</Text>
            </Box>
          </SimpleGrid>
          <Text fontSize="sm" color="gray.500">
            Posted on: {new Date(post.created_at).toLocaleDateString()}
          </Text>
          <Divider />
          <VStack align="stretch" spacing={4}>
            {renderMatchSection("Exact Matches", matches.exactMatches)}
            {renderMatchSection("State & Job Matches", matches.partialMatchesStateJob)}
            {renderMatchSection("State, District & Job Matches", matches.partialMatchesStateDistrictJob)}
          </VStack>
        </VStack>
      </Box>
    )
  }, [bgColor, borderColor, headingColor, textColor, findMatches, allJobPosts, renderMatchSection, handleDeletePost])

  const renderMultiWayMatch = useCallback((match: MultiWayMatch, index: number) => {
    return (
      <Box 
        key={index}
        borderWidth={1} 
        borderRadius="lg" 
        p={6}
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="md"
        transition="all 0.3s"
        _hover={{ boxShadow: 'lg' }}
      >
        <Heading as="h3" size="md" color={headingColor} mb={4}>
          {match.participants.length}-Way Match
        </Heading>
        <VStack align="stretch" spacing={4}>
          {match.jobPosts.map(post => (
            <HStack key={post.id} justifyContent="space-between" p={2} bg={cardBgColor} borderRadius="md">
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{post.job_name} - {post.job_grade}</Text>
                <Text fontSize="sm">{post.current_location} → {post.expected_location}</Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
        <Divider my={4} />
        <Text fontWeight="bold" mb={2}>Connect Status:</Text>
        <VStack align="stretch" spacing={2}>
          {match.participants.map(participantId => {
            if (participantId === currentUserId) return null
            return (
              <HStack key={participantId} justifyContent="space-between" p={2} bg={cardBgColor} borderRadius="md">
                <Text fontSize="sm">User {participantId.slice(0, 8)}</Text>
                {renderConnectButton(participantId)}
              </HStack>
            )
          })}
        </VStack>
        {match.connectRequests.length === match.participants.length * (match.participants.length - 1) / 2 && 
         match.connectRequests.every(req => req.status === 'accepted') && (
          <Text mt={4} fontWeight="bold" color="green.500">
            All participants have accepted. You can now contact each other.
          </Text>
        )}
      </Box>
    )
  }, [bgColor, borderColor, headingColor, currentUserId, renderConnectButton, cardBgColor])

  const handleDonateClick = () => {
    window.open('https://bwtpgfxwnqquvqigtqkt.supabase.co/storage/v1/object/sign/qr/image-RwGVxYQGQAXsHu33vF09bR5uqOG9O2.avif?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJxci9pbWFnZS1Sd0dWeFlRR1FBWHNIdTMzdkYwOWJSNXVxT0c5TzIuYXZpZiIsImlhdCI6MTcyNzk1MjE5MCwiZXhwIjo4NjU3Mjc4NjU3OTB9.A5Y8Pn9ny5u-tS-FfoydU_b6m_2-y3Ja3bJ7gdKew0E&t=2024-10-03T10%3A43%3A10.546Z', '_blank')
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
          <Heading as="h2" size="xl" color={headingColor}>My Job Posts</Heading>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button
              onClick={fetchAllJobPosts}
              isLoading={isLoading}
              loadingText="Refreshing"
              colorScheme="blue"
              leftIcon={<RepeatIcon />}
            >
              Refresh
            </Button>
            <Button
              onClick={handleDonateClick}
              colorScheme="green"
              leftIcon={<ExternalLinkIcon />}
            >
              Donate
            </Button>
          </Stack>
        </Flex>
        {isLoading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : userJobPosts.length === 0 ? (
          <Text textAlign="center" fontSize="lg">You haven&apos;t created any job posts yet.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {userJobPosts.map(renderJobPost)}
          </SimpleGrid>
        )}
        <Divider my={8} />
        <Heading as="h2" size="xl" color={headingColor} mb={6}>Multi-Way Matches</Heading>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {multiWayMatches.map(renderMultiWayMatch)}
        </SimpleGrid>
      </VStack>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Connect Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Enter your phone number</FormLabel>
              <Input 
                type="tel" 
                placeholder="e.g., 0123456789" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={submitConnectRequest} leftIcon={<PhoneIcon />}>
              Send Request
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<CloseIcon />}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
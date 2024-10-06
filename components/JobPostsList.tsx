'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { sendJobMatchEmail } from '@/lib/mailjet'
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react'
import { ExternalLinkIcon, RepeatIcon, PhoneIcon, CheckIcon, CloseIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
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

export default function JobPostsList() {
  const [allJobPosts, setAllJobPosts] = useState<JobPost[]>([])
  const [userJobPosts, setUserJobPosts] = useState<JobPost[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectRequests, setConnectRequests] = useState<ConnectRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMatchUserId, setSelectedMatchUserId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [totalJobPostCount, setTotalJobPostCount] = useState<number>(0)
  const [showNotification, setShowNotification] = useState(false)
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
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

  const checkForMatches = useCallback(async (jobPosts: JobPost[], userId: string) => {
    const userPosts = jobPosts.filter(post => post.user_id === userId)
    const otherPosts = jobPosts.filter(post => post.user_id !== userId)

    let totalMatches = 0
    const matchedJobs: { [key: string]: number } = {}

    for (const userPost of userPosts) {
      const matches = otherPosts.filter(post => 
        post.job_name === userPost.job_name &&
        post.job_grade === userPost.job_grade &&
        post.current_location === userPost.expected_location &&
        post.expected_location === userPost.current_location
      )

      if (matches.length > 0) {
        totalMatches += matches.length
        matchedJobs[userPost.job_name] = (matchedJobs[userPost.job_name] || 0) + matches.length
      }
    }

    if (totalMatches > 0) {
      setShowNotification(true)

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user email:', userError)
        return
      }

      if (userData && userData.email) {
        for (const [jobName, matchCount] of Object.entries(matchedJobs)) {
          const jobPost = userPosts.find(post => post.job_name === jobName)
          if (jobPost) {
            await sendJobMatchEmail(userData.email, jobPost.job_name, jobPost.job_grade, matchCount)
          }
        }
      }
    }
  }, [])

  const fetchAllJobPosts = useCallback(async () => {
    if (!currentUserId) return
    setIsLoading(true)

    try {
      const { data, error, count } = await supabase
        .from('job_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setAllJobPosts(data || [])
      setUserJobPosts(data.filter(post => post.user_id === currentUserId) || [])
      setTotalJobPostCount(count || 0)

      await checkForMatches(data || [], currentUserId)
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
  }, [currentUserId, toast, checkForMatches])

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

  const fetchUserProfile = useCallback(async () => {
    if (!currentUserId) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', currentUserId)
        .single()

      if (error) throw error

      setUserPhoneNumber(data?.phone_number || null)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [currentUserId])

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

  

    return {
      exactMatches,
      partialMatchesStateJob,
      
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (currentUserId) {
      fetchAllJobPosts()
      fetchConnectRequests()
      fetchUserProfile()
    }
  }, [currentUserId, fetchAllJobPosts, fetchConnectRequests, fetchUserProfile])

  const handleConnectRequest = useCallback((matchUserId: string) => {
    setSelectedMatchUserId(matchUserId)
    if (userPhoneNumber) {
      setIsConfirmModalOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }, [userPhoneNumber])

  const confirmUsePhoneNumber = useCallback(async () => {
    if (!currentUserId || !selectedMatchUserId || !userPhoneNumber) return

    try {
      const { error } = await supabase
        .from('connect_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedMatchUserId,
          sender_phone: userPhoneNumber,
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

    setIsConfirmModalOpen(false)
  }, [currentUserId, selectedMatchUserId, userPhoneNumber, toast, fetchConnectRequests])

  const handleEditPhoneNumber = useCallback(() => {
    setIsConfirmModalOpen(false)
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
  }, [toast, fetchAllJobPosts])

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
          
          </VStack>
        </VStack>
      </Box>
    )
  }, [bgColor, borderColor, headingColor, textColor, findMatches, allJobPosts, renderMatchSection, handleDeletePost])

  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {showNotification && (
          <Alert status="success" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" borderRadius="md">
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Anda mempunyai padanan baru!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Terdapat padanan baru untuk pos kerja anda. Sila semak senarai pos kerja anda untuk maklumat lanjut.
            </AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setShowNotification(false)} />
          </Alert>
        )}
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
           
          </Stack>
        </Flex>
        <Stat>
          <StatLabel>Total Job Posts</StatLabel>
          <StatNumber>{totalJobPostCount}</StatNumber>
          <StatHelpText>From all users</StatHelpText>
        </Stat>
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
      </VStack>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Phone Number</ModalHeader>
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
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Phone Number</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Do you want to use this phone number for the connect request?</Text>
            <Text fontWeight="bold" mt={2}>{userPhoneNumber}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmUsePhoneNumber} leftIcon={<CheckIcon />}>
              Yes, use this number
            </Button>
            <Button variant="outline" onClick={handleEditPhoneNumber} leftIcon={<EditIcon />}>
              No, edit number
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
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
  CloseButton,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import { PhoneIcon, CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons'
import { sendJobMatchEmail } from '@/lib/mailjet'

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

interface ConnectRequest {
  id: string
  sender_id: string
  receiver_id: string
  sender_phone: string
  receiver_phone: string | null
  status: 'pending' | 'accepted'
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone_number: string
}

export default function ThreeWayMatcher() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [matches, setMatches] = useState<ThreeWayMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [connectRequests, setConnectRequests] = useState<ConnectRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedMatchUserId, setSelectedMatchUserId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [previousMatchCount, setPreviousMatchCount] = useState(0)
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({})

  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }, [])

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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [])

  const fetchAllUserProfiles = useCallback(async (userIds: string[]) => {
    const profiles: { [key: string]: UserProfile } = {}
    for (const userId of userIds) {
      const profile = await fetchUserProfile(userId)
      if (profile) {
        profiles[userId] = profile
      }
    }
    setUserProfiles(profiles)
  }, [fetchUserProfile])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    fetchJobPosts()
  }, [fetchJobPosts])

  useEffect(() => {
    if (currentUserId) {
      fetchConnectRequests()
      fetchUserProfile(currentUserId).then(profile => {
        if (profile) {
          setUserPhoneNumber(profile.phone_number || null)
        }
      })
    }
  }, [currentUserId, fetchConnectRequests, fetchUserProfile])

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

      if (threeWayMatches.length > previousMatchCount) {
        setShowNotification(true)
        setPreviousMatchCount(threeWayMatches.length)

        // Send email notification
        fetchUserProfile(currentUserId!).then(userData => {
          if (userData && userData.email) {
            sendJobMatchEmail(userData.email, 'Three-Way Match', 'N/A', threeWayMatches.length - previousMatchCount)
          }
        })
      }

      // Fetch user profiles for all users in the matches
      const userIds = new Set(threeWayMatches.flatMap(match => match.posts.map(post => post.user_id)))
      fetchAllUserProfiles(Array.from(userIds))
    }
  }, [jobPosts, findThreeWayMatches, previousMatchCount, fetchUserProfile, currentUserId, fetchAllUserProfiles])

  const handleRefresh = () => {
    fetchJobPosts()
  }

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
          as="a"
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
      {showNotification && (
        <Alert status="success" variant="subtle" flexDirection="column" alignItems="center"
          justifyContent="center" textAlign="center" borderRadius="md" mb={6}>
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Anda mempunyai padanan tiga penjuru baru!
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Terdapat padanan tiga penjuru baru untuk pos kerja anda. Sila semak senarai padanan untuk maklumat lanjut.
          </AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setShowNotification(false)} />
        </Alert>
      )}
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
                    <Text fontWeight="bold">
                      {userProfiles[post.user_id]?.full_name || `User ${postIndex + 1}`}
                    </Text>
                    <Badge colorScheme="blue">{post.job_name} - {post.job_grade}</Badge>
                  </HStack>
                  <Text>Current Location: {post.current_location}</Text>
                  <Text>Expected Location: {post.expected_location}</Text>
                  {post.user_id !== currentUserId && renderConnectButton(post.user_id)}
                </VStack>
              ))}
            </Box>
          ))}
        </VStack>
      )}

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
    </Box>
  )
}
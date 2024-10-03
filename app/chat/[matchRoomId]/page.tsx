'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  useToast,
  Divider,
  IconButton,
  Spinner,
} from '@chakra-ui/react'
import { ArrowBackIcon, ChatIcon } from '@chakra-ui/icons'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  chat_room_id: string
}

interface JobPost {
  job_name: string
  job_grade: string
}

interface ChatRoom {
  id: string
  user_ids: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserJob, setCurrentUserJob] = useState<JobPost | null>(null)
  const [matchUserJob, setMatchUserJob] = useState<JobPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const { matchRoomId } = useParams()
  const toast = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error fetching current user:', error)
      toast({
        title: 'Error',
        description: 'Unable to fetch user information. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return null
    }
    return user
  }, [toast])

  const initializeChatRoom = useCallback(async (userId: string, roomId: string) => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      console.error('Error fetching chat room:', error)
      toast({
        title: 'Error',
        description: 'Unable to access chat room. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    if (!data.user_ids.includes(userId)) {
      toast({
        title: 'Unauthorized',
        description: 'You are not authorized to access this chat room.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    setChatRoom(data)
    return true
  }, [toast])

  const fetchJobPosts = useCallback(async (userId: string) => {
    if (!chatRoom) return

    const matchUserId = chatRoom.user_ids.find(id => id !== userId)

    if (!matchUserId) {
      console.error('Match user not found in chat room')
      return
    }

    const { data: currentUserData, error: currentUserError } = await supabase
      .from('job_posts')
      .select('job_name, job_grade')
      .eq('user_id', userId)
      .single()

    const { data: matchUserData, error: matchUserError } = await supabase
      .from('job_posts')
      .select('job_name, job_grade')
      .eq('user_id', matchUserId)
      .single()

    if (currentUserError) {
      console.error('Error fetching current user job post:', currentUserError)
    } else {
      setCurrentUserJob(currentUserData)
    }

    if (matchUserError) {
      console.error('Error fetching match user job post:', matchUserError)
    } else {
      setMatchUserJob(matchUserData)
    }
  }, [chatRoom])

  const fetchMessages = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error fetching messages',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } else {
      setMessages(data || [])
    }
  }, [toast])

  useEffect(() => {
    async function initialize() {
      const user = await fetchCurrentUser()
      if (user && matchRoomId) {
        setCurrentUserId(user.id)
        const authorized = await initializeChatRoom(user.id, matchRoomId as string)
        setIsAuthorized(authorized)
        if (authorized) {
          await fetchJobPosts(user.id)
          await fetchMessages(matchRoomId as string)
        }
      }
      setIsLoading(false)
    }
    initialize()
  }, [fetchCurrentUser, initializeChatRoom, matchRoomId, fetchJobPosts, fetchMessages])

  useEffect(() => {
    if (matchRoomId) {
      const channel = supabase.channel(`chat_room_${matchRoomId}`)

      channel
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `chat_room_id=eq.${matchRoomId}`
          }, 
          (payload) => {
            console.log('New message received:', payload.new)
            const newMessage = payload.new as Message
            setMessages(prevMessages => [...prevMessages, newMessage])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [matchRoomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (newMessage.trim() === '' || !isAuthorized || !matchRoomId || !currentUserId) return

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: currentUserId,
        content: newMessage.trim(),
        chat_room_id: matchRoomId
      })

    if (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error sending message',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } else {
      setNewMessage('')
    }
  }

  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function handleExitChat() {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!isAuthorized) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center" flexDirection="column">
        <Text fontSize="xl" mb={4}>You are not authorized to access this chat.</Text>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </Flex>
    )
  }

  return (
    <Box maxWidth="800px" margin="auto" height="calc(100vh - 100px)" display="flex" flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center" p={4} bg="blue.500" color="white">
        <Flex alignItems="center">
          <IconButton
            aria-label="Exit chat"
            icon={<ArrowBackIcon />}
            onClick={handleExitChat}
            variant="ghost"
            color="white"
            mr={4}
          />
          <ChatIcon mr={2} />
          <Heading as="h1" size="lg">
            Chat with {matchUserJob ? `${matchUserJob.job_name} (${matchUserJob.job_grade})` : 'User'}
          </Heading>
        </Flex>
        <Text>You: {currentUserJob ? `${currentUserJob.job_name} (${currentUserJob.job_grade})` : 'Unknown'}</Text>
      </Flex>
      <Divider />
      <VStack spacing={4} align="stretch" flex={1} overflowY="auto" p={4} bg="gray.50">
        {messages.map((message) => (
          <Flex
            key={message.id}
            alignSelf={message.sender_id === currentUserId ? 'flex-end' : 'flex-start'}
            maxWidth="70%"
          >
            <Box
              bg={message.sender_id === currentUserId ? 'blue.100' : 'white'}
              p={3}
              borderRadius="lg"
              boxShadow="md"
            >
              <Text>{message.content}</Text>
              <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                {formatTimestamp(message.created_at)}
              </Text>
            </Box>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <Divider />
      <Box p={4} bg="white">
        <form onSubmit={sendMessage}>
          <Flex>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              mr={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
            />
            <Button colorScheme="blue" type="submit">
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  )
}
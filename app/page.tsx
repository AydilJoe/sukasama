'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Button,
  useColorModeValue,
  useToast,
  Flex,
  SimpleGrid,
  Icon,
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
import { FaSearch, FaExchangeAlt, FaClipboardList } from 'react-icons/fa'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import SEO from '@/components/SEO'
import JobPostsList from '@/components/JobPostsList'
import JobPostForm from '@/components/JobPostForm'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [postCount, setPostCount] = useState<number>(0)
  const [showNotification, setShowNotification] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const primaryColor = useColorModeValue('blue.600', 'blue.300')

  const checkForMatches = useCallback(async (userId: string) => {
    try {
      const { data: userPosts, error: userPostsError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', userId)

      if (userPostsError) throw userPostsError

      const { data: allPosts, error: allPostsError } = await supabase
        .from('job_posts')
        .select('*')
        .neq('user_id', userId)

      if (allPostsError) throw allPostsError

      const matches = userPosts.some(userPost => 
        allPosts.some(post => 
          post.job_name === userPost.job_name &&
          post.job_grade === userPost.job_grade &&
          post.current_location === userPost.expected_location &&
          post.expected_location === userPost.current_location
        )
      )

      setShowNotification(matches)
    } catch (error) {
      console.error('Error checking for matches:', error)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkForMatches(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        checkForMatches(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [checkForMatches])

  useEffect(() => {
    const fetchCounts = async () => {
      const { count, error } = await supabase
        .from('job_posts')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching post count:', error)
      } else {
        setPostCount(count || 0)
      }
    }

    fetchCounts()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Error logging out",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handlePostCreated = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1)
    toast({
      title: "Job post created",
      description: "Your job post has been created successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    })
  }, [toast])

  return (
    <>
      <SEO 
        title="SukaSamaSuka - Platform Pertukaran Kerja Penjawat Awam Malaysia"
        description="SukaSamaSuka memudahkan proses pertukaran kerja untuk penjawat awam Malaysia. Cari peluang pertukaran yang sesuai dengan mudah dan cepat."
        keywords={['pertukaran kerja', 'penjawat awam', 'Malaysia', 'SukaSamaSuka']}
        ogImage="https://www.suka-sama-suka.com/og-image.jpg"
      />
      <Box minHeight="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={6}>
          <VStack spacing={6} align="stretch">
            <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
              <VStack align="flex-start" spacing={2}>
                <Heading as="h1" size="2xl" color={primaryColor}>
                  SukaSamaSuka
                </Heading>
                <Text fontSize="xl" fontWeight="medium" color="gray.500">
                  Pertukaran suka sama suka untuk penjawat awam Malaysia
                </Text>
              </VStack>
              {session && (
                <HStack>
                  <Text>Selamat datang, {session.user.email}</Text>
                  <Button onClick={handleLogout} colorScheme="red" size="sm">Log Keluar</Button>
                </HStack>
              )}
            </Flex>

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

            {session ? (
              <VStack spacing={8} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <StatCard
                    icon={FaClipboardList}
                    title="Jumlah Pos Kerja"
                    value={postCount.toString()}
                  />
                  <StatCard
                    icon={FaExchangeAlt}
                    title="Pertukaran Aktif"
                    value="24"
                  />
                  <StatCard
                    icon={FaSearch}
                    title="Carian Hari Ini"
                    value="56"
                  />
                </SimpleGrid>
                <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
                  <Heading as="h2" size="lg" mb={4}>
                    Cipta Pos Kerja Baru
                  </Heading>
                  <JobPostForm onPostCreated={handlePostCreated} />
                </Box>
                <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
                  <Heading as="h2" size="lg" mb={4}>
                    Pos Kerja Terkini
                  </Heading>
                  <JobPostsList key={refreshKey} />
                </Box>
              </VStack>
            ) : (
              <VStack spacing={8} align="center" bg={cardBgColor} p={8} borderRadius="lg" boxShadow="md">
                <Text fontSize="xl" textAlign="center">
                  Sila log masuk untuk mencipta dan melihat pos kerja anda.
                </Text>
                <Button 
                  onClick={() => router.push('/auth')} 
                  colorScheme="blue" 
                  size="lg"
                >
                  Log Masuk / Daftar
                </Button>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  )
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
}

function StatCard({ icon, title, value }: StatCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  return (
    <Stat bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
      <Flex alignItems="center" mb={2}>
        <Icon as={icon} w={6} h={6} color="blue.500" mr={2} />
        <StatLabel fontSize="sm">{title}</StatLabel>
      </Flex>
      <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
      <StatHelpText fontSize="xs">Updated just now</StatHelpText>
    </Stat>
  )
}
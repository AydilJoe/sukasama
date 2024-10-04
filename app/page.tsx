'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Button,
  Input,
  useColorModeValue,
  useToast,
  Flex,
  SimpleGrid,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
} from '@chakra-ui/react'
import { FaSearch, FaExchangeAlt, FaUserTie, FaUsers, FaClipboardList } from 'react-icons/fa'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import SEO from '@/components/SEO'
import { jobGrades } from '@/data/jobGrades'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [jobSearch, setJobSearch] = useState('')
  const [userCount, setUserCount] = useState<number>(0)
  const [postCount, setPostCount] = useState<number>(0)
  const router = useRouter()
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const primaryColor = useColorModeValue('blue.600', 'blue.300')

  const uniqueJobNames = useMemo(() => {
    const names = Array.from(new Set(jobGrades.map(job => job.name)))
    return names.sort((a, b) => a.localeCompare(b))
  }, [])

  const filteredJobs = useMemo(() => {
    return uniqueJobNames.filter(name => 
      name.toLowerCase().includes(jobSearch.toLowerCase())
    )
  }, [uniqueJobNames, jobSearch])

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

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (userError) {
        console.error('Error fetching user count:', userError)
      } else {
        setUserCount(userCount || 0)
      }

      const { count: postCount, error: postError } = await supabase
        .from('job_posts')
        .select('*', { count: 'exact', head: true })

      if (postError) {
        console.error('Error fetching post count:', postError)
      } else {
        setPostCount(postCount || 0)
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

  return (
    <>
      <SEO 
        title="SukaSamaSuka - Platform Pertukaran Kerja Penjawat Awam Malaysia"
        description="SukaSamaSuka memudahkan proses pertukaran kerja untuk penjawat awam Malaysia. Cari peluang pertukaran yang sesuai dengan mudah dan cepat."
        keywords={['pertukaran kerja', 'penjawat awam', 'Malaysia', 'SukaSamaSuka']}
        ogImage="https://www.suka-sama-suka.com/og-image.jpg"
      />
      <Box minHeight="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
              <VStack align="flex-start" spacing={0}>
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

            {session ? (
              <VStack spacing={8} align="stretch">
                <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
                  <VStack spacing={4} align="stretch">
                    <Heading as="h2" size="lg">
                      Cari Peluang Pertukaran
                    </Heading>
                    <Box position="relative">
                      <Input
                        placeholder="Cari jawatan..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        pr="4rem"
                      />
                      <Icon
                        as={FaSearch}
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        color="gray.400"
                      />
                    </Box>
                    {jobSearch && (
                      <List spacing={2} maxH="200px" overflowY="auto">
                        {filteredJobs.map((job, index) => (
                          <ListItem
                            key={index}
                            p={2}
                            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            cursor="pointer"
                            onClick={() => setJobSearch(job)}
                          >
                            {job}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </VStack>
                </Box>
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                  <StatCard
                    icon={FaUsers}
                    title="Pengguna Berdaftar"
                    value={userCount.toString()}
                  />
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
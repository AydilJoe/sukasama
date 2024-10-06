'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import JobPostForm from '@/components/JobPostForm'
import JobPostsList from '@/components/JobPostsList'
import UserProfile from '@/components/UserProfile'
import LogoutButton from '@/components/LogoutButton'
import SEO from '@/components/SEO'
import ThreeWayMatcher from '@/components/ThreeWayMatcher'
import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  useColorModeValue, 
  Text, 
  SimpleGrid, 
  Icon,
  Button,
  Link,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { Session } from '@supabase/supabase-js'
import { FaExchangeAlt, FaMapMarkedAlt, FaLock } from 'react-icons/fa'
import NextLink from 'next/link'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const primaryColor = useColorModeValue('blue.500', 'blue.300')

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
    <>
      <SEO 
        title="SukaSamaSuka - Job Matching Platform for Malaysian Civil Servants"
        description="SukaSamaSuka is the premier job matching platform for Malaysian civil servants. Easily find and connect with other civil servants looking to swap positions across Malaysia. Pertukaran suka sama suka untuk penjawat awam Malaysia."
        keywords={['job matching', 'Malaysian civil servants', 'job swap', 'government jobs', 'Malaysia', 'career change', 'penjawat awam', 'pertukaran kerja']}
        ogImage="https://www.suka-sama-suka.com/og-image.jpg"
      />
      <meta name="google-site-verification" content="J6_bNMdHhm9jMxGJXJ4ugeErGUGU9iG23VscVVzDhWc" />
      <Box minHeight="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={12} align="stretch">
            <HStack justifyContent="space-between" alignItems="center" wrap="wrap">
              <VStack align="flex-start" spacing={0}>
                <Heading as="h1" size="2xl" color={primaryColor}>
                  SukaSamaSuka 
                </Heading>
                <Heading as="h2" size="l" color={primaryColor}>
                  by AJ
                </Heading>
                <Text fontSize="xl" fontWeight="medium" color="gray.500">
                  Pertukaran suka sama suka untuk penjawat awam Malaysia
                </Text>
              </VStack>
              {session && <LogoutButton />}
            </HStack>

            {!session ? (
              <VStack spacing={8} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                  <Feature
                    icon={FaExchangeAlt}
                    title="Mudah Bertukar"
                    text="Cari peluang pertukaran kerja yang sesuai dengan sistem pemadanan pintar kami."
                  />
                  <Feature
                    icon={FaMapMarkedAlt}
                    title="Rangkaian Seluruh Negara"
                    text="Hubungi penjawat awam dari seluruh negeri dan daerah di Malaysia."
                  />
                  <Feature
                    icon={FaLock}
                    title="Platform Selamat"
                    text="Data anda dilindungi dengan langkah-langkah keselamatan terkini."
                  />
                </SimpleGrid>

                <Box
                  bg={cardBgColor}
                  borderRadius="lg"
                  boxShadow="md"
                  p={8}
                >
                  <VStack spacing={4} align="stretch">
                    <Heading as="h2" size="lg" textAlign="center">
                      Mulakan Perjalanan Kerjaya Baru Anda
                    </Heading>
                    <Text textAlign="center">
                      Daftar atau log masuk untuk meneroka peluang pertukaran kerja yang menarik.
                    </Text>
                    <Auth />
                  </VStack>
                </Box>

                <VStack spacing={4} align="center">
                  <Heading as="h2" size="lg">
                    Mengapa Memilih SukaSamaSuka?
                  </Heading>
                  <Text textAlign="center" maxW="2xl">
                    SukaSamaSuka adalah platform inovatif yang memudahkan proses pertukaran kerja untuk penjawat awam Malaysia. 
                    Kami menghubungkan anda dengan peluang di seluruh negara, membantu anda mencapai keseimbangan kerja-kehidupan yang lebih baik.
                  </Text>
                  <NextLink href="/about" passHref>
                    <Button as="a" colorScheme="blue" size="lg">
                      Ketahui Lebih Lanjut
                    </Button>
                  </NextLink>
                </VStack>
              </VStack>
            ) : (
              <Box>
                <Tabs isFitted variant="enclosed">
                  <TabList mb="1em">
                    <Tab>Pos Kerja</Tab>
                    <Tab>Padanan Tiga Penjuru</Tab>
                    <Tab>Profil Pengguna</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Box
                        bg={cardBgColor}
                        borderRadius="lg"
                        boxShadow="md"
                        p={6}
                        mb={8}
                      >
                        <Heading as="h2" size="lg" mb={4}>
                          Cipta Pos Kerja Baru
                        </Heading>
                        <JobPostForm onPostCreated={handlePostCreated} />
                      </Box>
                      <Divider my={8} />
                      <Box
                        bg={cardBgColor}
                        borderRadius="lg"
                        boxShadow="md"
                        p={6}
                      >
                        <Heading as="h2" size="lg" mb={4}>
                          Pos Kerja Terkini
                        </Heading>
                        <JobPostsList key={refreshKey} />
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Box
                        bg={cardBgColor}
                        borderRadius="lg"
                        boxShadow="md"
                        p={6}
                      >
                        <Heading as="h2" size="lg" mb={4}>
                          Padanan Tiga Penjuru
                        </Heading>
                        <ThreeWayMatcher />
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Box
                        bg={cardBgColor}
                        borderRadius="lg"
                        boxShadow="md"
                        p={6}
                      >
                        <Heading as="h2" size="lg" mb={4}>
                          Profil Pengguna
                        </Heading>
                        <UserProfile session={session} />
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            )}

            <Box as="footer" textAlign="center" pt={8}>
              <Text fontSize="sm" color="gray.500">
                © 2024 SukaSamaSuka. Hak Cipta Terpelihara.
              </Text>
              <HStack justifyContent="center" mt={2} fontSize="sm" color="gray.500">
                <Link as={NextLink} href="/privacy">Dasar Privasi</Link>
                <Link as={NextLink} href="/terms">Terma Penggunaan</Link>
                <Link as={NextLink} href="/contact">Hubungi Kami</Link>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

interface FeatureProps {
  title: string
  text: string
  icon: React.ElementType
}

function Feature({ title, text, icon }: FeatureProps) {
  return (
    <VStack>
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="lg">{title}</Text>
      <Text textAlign="center">{text}</Text>
    </VStack>
  )
}
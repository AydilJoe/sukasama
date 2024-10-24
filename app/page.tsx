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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { Session } from '@supabase/supabase-js'
import { FaExchangeAlt, FaMapMarkedAlt, FaLock } from 'react-icons/fa'
import NextLink from 'next/link'
import { motion } from 'framer-motion'

const AnimatedBackground = () => {
  const gradientStart = useColorModeValue('gray.700', 'gray.900')
  const gradientEnd = useColorModeValue('gray.600', 'gray.800')

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={-1}
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-br, ${gradientStart}, ${gradientEnd})`}
      />
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            background: 'white',
            borderRadius: '50%',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 200 - 100],
            x: [0, Math.random() * 200 - 100],
            scale: [1, Math.random() * 1.5 + 0.5],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  )
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.5)', 'rgba(26, 32, 44, 0.5)')
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
        ogImage="https://www.suka-sama-suka.com/logo.png"
      />

     
     
     <meta name="google-adsense-account" content="ca-pub-1513356284203988"/>
      <AnimatedBackground />
      <Box minHeight="100vh" bg={bgColor} color={textColor} position="relative" zIndex={3} backdropFilter="blur(1px)">
        <Container maxW="container.xl" py={6}>
          <VStack spacing={12} align="stretch">
            <HStack justifyContent="space-between" alignItems="center" wrap="wrap">
              <VStack align="flex-start" spacing={0}>
                
                <Heading as="h1" size="2xl" color={primaryColor}>
                  SukaSamaSuka 
                </Heading>
                <Heading as="h2" size="l" color={primaryColor}>
                  by AJ
                </Heading>
                <Text fontSize="xl" fontWeight="medium" color={useColorModeValue("gray.600", "gray.300")}>
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
                    
                     <Alert status="success" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" borderRadius="md">
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Notis!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Makin ramai yang sertai, makin tinggi peluang anda menemui padanan sempurna. Kongsi sekarang dan bersama-sama kita wujudkan komuniti penjawat awam yang lebih gembira dan produktif!
                    #SukaSamaSuka #KerjayaImpian #PenjawatAwamMalaysia 
            </AlertDescription>
            
          </Alert>

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
                <Box
                  bg={cardBgColor}
                  borderRadius="lg"
                  boxShadow="md"
                  p={6}
                  mb={8}
                >
                  <Heading as="h2" size="lg" mb={4}>
                    Profil Pengguna
                  </Heading>
                  <UserProfile session={session} />
                </Box>
                <Box
                  bg={cardBgColor}
                  borderRadius="lg"
                  boxShadow="md"
                  p={6}
                  mb={8}
                >
                  <Heading as="h2" size="lg" mb={4}>
                    Pos Tukar Suka Sama Suka
                  </Heading>
                  <JobPostForm onPostCreated={handlePostCreated} />
                </Box>

                <Divider my={8} />
                <Box
                  bg={cardBgColor}
                  borderRadius="lg"
                  boxShadow="md"
                  p={6}
                  mb={8}
                >
                  <Heading as="h2" size="lg" mb={4}>
                    Pos Kerja Terkini
                  </Heading>
                  <JobPostsList key={refreshKey} />
                </Box>
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
              </Box>
            )}

            <Box as="footer" textAlign="center" pt={8}>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                © 2024 SukaSamaSuka. Hak Cipta Terpelihara.
              </Text>
             
              <HStack justifyContent="center" mt={2} fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                <Link as={NextLink} href="/privacy">Dasar Privasi</Link>
                <Link as={NextLink} href="/terms">Terma Penggunaan</Link>
                <Link as={NextLink} href="/contact">Hubungi Kami</Link>
                <Link href="/qr.png">Donate</Link>
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
      <Icon as={icon} w={10} h={10} color={useColorModeValue("blue.500", "blue.300")} />
      <Text fontWeight="bold" fontSize="lg">{title}</Text>
      <Text textAlign="center">{text}</Text>
    </VStack>
  )
}
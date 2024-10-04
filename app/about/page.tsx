'use client'

import { Box, Container, Heading, Text, SimpleGrid, VStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { FaHandshake, FaMapMarkedAlt, FaLock } from 'react-icons/fa'
import SEO from '@/components/SEO'

export default function About() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'gray.200')
  const headingColor = useColorModeValue('blue.600', 'blue.300')

  return (
    <>
      <SEO 
        title="Tentang SukaSamaSuka - Platform Pertukaran Kerja Penjawat Awam Malaysia"
        description="Ketahui lebih lanjut tentang SukaSamaSuka, platform inovatif untuk pertukaran kerja penjawat awam Malaysia."
        keywords={['SukaSamaSuka', 'pertukaran kerja', 'penjawat awam Malaysia', 'kerjaya kerajaan']}
        ogImage="https://www.suka-sama-suka.com/og-image.jpg"
      />
      <Box bg={bgColor} color={textColor} minHeight="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            <Heading as="h1" size="2xl" textAlign="center" color={headingColor}>
              Tentang SukaSamaSuka
            </Heading>
            
            <Text fontSize="xl" textAlign="center" maxW="3xl" mx="auto">
              SukaSamaSuka adalah platform inovatif yang memudahkan proses pertukaran kerja untuk penjawat awam Malaysia. 
              Kami bertujuan untuk meningkatkan kepuasan kerjaya dan kesejahteraan penjawat awam di seluruh negara.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <Feature
                icon={FaHandshake}
                title="Pemadanan Pintar"
                description="Sistem kami memadankan anda dengan peluang pertukaran yang sesuai berdasarkan kemahiran, pengalaman, dan pilihan anda."
              />
              <Feature
                icon={FaMapMarkedAlt}
                title="Liputan Seluruh Negara"
                description="Akses peluang pertukaran di seluruh Malaysia, dari bandar besar hingga ke kawasan luar bandar."
              />
              <Feature
                icon={FaLock}
                title="Keselamatan Terjamin"
                description="Kami mengutamakan keselamatan data anda dengan teknologi penyulitan terkini dan amalan keselamatan terbaik."
              />
            </SimpleGrid>

            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="xl" textAlign="center" color={headingColor}>
                Visi Kami
              </Heading>
              <Text fontSize="lg" textAlign="center">
                Kami membayangkan sebuah perkhidmatan awam yang dinamik dan responsif, di mana setiap penjawat awam 
                dapat dengan mudah mencari dan melaksanakan pertukaran kerja yang memenuhi aspirasi kerjaya dan kehidupan peribadi mereka.
              </Text>
            </VStack>

            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="xl" textAlign="center" color={headingColor}>
                Mengapa Memilih SukaSamaSuka?
              </Heading>
              <Text fontSize="lg" textAlign="center">
                SukaSamaSuka bukan sekadar platform pertukaran kerja biasa. Kami memahami cabaran unik yang dihadapi 
                oleh penjawat awam Malaysia dan telah mereka bentuk penyelesaian yang memenuhi keperluan khusus anda.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

interface FeatureProps {
  icon: React.ElementType
  title: string
  description: string
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <VStack>
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="xl">{title}</Text>
      <Text textAlign="center">{description}</Text>
    </VStack>
  )
}
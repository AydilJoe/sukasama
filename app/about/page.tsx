'use client'

import { Box, Container, Heading, Text, VStack, SimpleGrid, Icon, Button, Image, Flex } from '@chakra-ui/react'
import { FaHandshake, FaMapMarkedAlt, FaLock, FaLightbulb } from 'react-icons/fa'
import SEO from '@/components/SEO'
import NextLink from 'next/link'

export default function About() {
  return (
    <>
      <SEO 
        title="Tentang SukaSamaSuka - Platform Pertukaran Kerja Penjawat Awam Malaysia"
        description="Ketahui lebih lanjut tentang SukaSamaSuka, platform inovatif untuk pertukaran kerja penjawat awam Malaysia. Kami memudahkan proses pertukaran dan meningkatkan kepuasan kerjaya."
        keywords={['SukaSamaSuka', 'pertukaran kerja', 'penjawat awam Malaysia', 'kerjaya kerajaan', 'platform pertukaran']}
      />
      <Box as="main" minHeight="100vh" bg="gray.50" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            <VStack spacing={4} textAlign="center">
              <Heading as="h1" size="2xl" color="blue.600">
                Tentang SukaSamaSuka
              </Heading>
              <Text fontSize="xl" maxW="2xl" mx="auto">
                Memperkasakan penjawat awam Malaysia untuk mencapai keseimbangan kerjaya dan kehidupan yang lebih baik melalui pertukaran kerja yang mudah dan efisien.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Ilustrasi SukaSamaSuka"
                width={600}
                height={400}
                objectFit="cover"
                borderRadius="lg"
              />
              <VStack align="start" spacing={6}>
                <Heading as="h2" size="xl">
                  Cerita Kami
                </Heading>
                <Text fontSize="lg">
                  SukaSamaSuka lahir daripada kekecewaan pengasas kami terhadap ketiadaan platform khusus untuk penjawat awam menukar lokasi kerja dengan mudah. Sebagai bekas penjawat awam, beliau memahami cabaran yang dihadapi oleh rakan-rakan seperjuangan dalam mencari peluang pertukaran yang sesuai.
                </Text>
                <Text fontSize="lg">
                  Kekecewaan ini menjadi pemangkin untuk mencipta penyelesaian yang memudahkan proses pertukaran, sekali gus meningkatkan kepuasan kerjaya dan kesejahteraan penjawat awam di seluruh Malaysia.
                </Text>
              </VStack>
            </SimpleGrid>

            <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center" justify="center" bg="blue.50" p={8} borderRadius="lg">
              <Icon as={FaLightbulb} w={16} h={16} color="blue.500" />
              <VStack align="start" spacing={4}>
                <Heading as="h3" size="lg">
                  Visi Pengasas
                </Heading>
                <Text fontSize="md">
                  &ldquo;Saya bayangkan sebuah platform di mana setiap penjawat awam boleh dengan mudah mencari dan melaksanakan pertukaran kerja yang memenuhi aspirasi kerjaya dan kehidupan peribadi mereka. SukaSamaSuka adalah perwujudan visi ini - satu langkah ke arah perkhidmatan awam yang lebih dinamik dan responsif di Malaysia.&rdquo;
                </Text>
                <Text fontWeight="bold">- Pengasas SukaSamaSuka</Text>
              </VStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <Feature
                icon={FaHandshake}
                title="Pemadanan Pintar"
                text="Algoritma kami memadankan anda dengan peluang pertukaran yang paling sesuai berdasarkan kemahiran, pengalaman, dan pilihan anda."
              />
              <Feature
                icon={FaMapMarkedAlt}
                title="Liputan Seluruh Negara"
                text="Akses peluang pertukaran di seluruh Malaysia, dari bandar besar hingga ke kawasan luar bandar."
              />
              <Feature
                icon={FaLock}
                title="Keselamatan Terjamin"
                text="Kami mengutamakan keselamatan data anda dengan menggunakan teknologi penyulitan terkini dan amalan keselamatan terbaik."
              />
            </SimpleGrid>

            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl">
                Mengapa Memilih SukaSamaSuka?
              </Heading>
              <Text fontSize="lg" maxW="2xl" mx="auto">
                SukaSamaSuka bukan sekadar platform pertukaran kerja biasa. Kami memahami cabaran unik yang dihadapi oleh penjawat awam Malaysia dan telah mereka bentuk penyelesaian yang memenuhi keperluan khusus anda.
              </Text>
              <Button as={NextLink} href="/auth" size="lg" colorScheme="blue">
                Mulakan Perjalanan Anda
              </Button>
            </VStack>

            <VStack spacing={6}>
              <Heading as="h2" size="xl" textAlign="center">
                Soalan Lazim
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <FAQ
                  question="Siapa yang boleh menggunakan SukaSamaSuka?"
                  answer="SukaSamaSuka terbuka kepada semua penjawat awam Malaysia yang berminat untuk pertukaran kerja."
                />
                <FAQ
                  question="Adakah perkhidmatan ini percuma?"
                  answer="Ya, SukaSamaSuka adalah platform percuma untuk semua penjawat awam Malaysia."
                />
                <FAQ
                  question="Bagaimana proses pemadanan berfungsi?"
                  answer="Kami menggunakan algoritma canggih untuk memadankan profil anda dengan peluang pertukaran yang sesuai berdasarkan pelbagai faktor seperti jawatan, lokasi, dan kemahiran."
                />
                <FAQ
                  question="Bolehkah saya membatalkan permintaan pertukaran?"
                  answer="Ya, anda boleh membatalkan atau mengemas kini permintaan pertukaran anda pada bila-bila masa melalui dashboard akaun anda."
                />
              </SimpleGrid>
            </VStack>
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
      <Text fontWeight="bold" fontSize="xl">{title}</Text>
      <Text textAlign="center">{text}</Text>
    </VStack>
  )
}

interface FAQProps {
  question: string
  answer: string
}

function FAQ({ question, answer }: FAQProps) {
  return (
    <VStack align="start" spacing={2}>
      <Text fontWeight="bold" fontSize="lg">{question}</Text>
      <Text>{answer}</Text>
    </VStack>
  )
}
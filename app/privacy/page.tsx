'use client'

import { Box, Container, Heading, Text, VStack,HStack, UnorderedList, ListItem, useColorModeValue } from '@chakra-ui/react'
import SEO from '@/components/SEO'

export default function PrivacyPolicy() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <>
      <SEO 
        title="Dasar Privasi - SukaSamaSuka"
        description="Dasar Privasi SukaSamaSuka - Ketahui bagaimana kami melindungi maklumat peribadi anda dalam platform pertukaran kerja untuk penjawat awam Malaysia."
        keywords={['dasar privasi', 'perlindungan data', 'SukaSamaSuka', 'penjawat awam Malaysia']}
      />
      <Box as="main" minHeight="100vh" bg={bgColor} py={12}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch" bg={cardBgColor} p={8} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
            <Heading as="h1" size="2xl" textAlign="center">Dasar Privasi</Heading>
            <Text>
              Selamat datang ke Dasar Privasi SukaSamaSuka. Kami menghargai kepercayaan anda dan komited untuk melindungi maklumat peribadi anda.
            </Text>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading as="h2" size="lg" mb={4}>1. Maklumat yang Kami Kumpul</Heading>
                <Text mb={2}>
                  Kami mengumpul maklumat berikut:
                </Text>
                <UnorderedList pl={4} spacing={2}>
                  <ListItem>Maklumat peribadi seperti nama, alamat e-mel, dan nombor telefon</ListItem>
                  <ListItem>Maklumat pekerjaan termasuk jawatan semasa dan lokasi</ListItem>
                  <ListItem>Pilihan pertukaran kerja yang anda nyatakan</ListItem>
                </UnorderedList>
              </Box>
              <Box>
                <Heading as="h2" size="lg" mb={4}>2. Penggunaan Maklumat</Heading>
                <Text mb={2}>
                  Kami menggunakan maklumat anda untuk:
                </Text>
                <UnorderedList pl={4} spacing={2}>
                  <ListItem>Memadankan anda dengan peluang pertukaran kerja yang sesuai</ListItem>
                  <ListItem>Menambah baik perkhidmatan kami</ListItem>
                  <ListItem>Berkomunikasi dengan anda mengenai akaun dan perkhidmatan kami</ListItem>
                </UnorderedList>
              </Box>
              <Box>
                <Heading as="h2" size="lg" mb={4}>3. Perlindungan Data</Heading>
                <Text>
                  Kami mengambil langkah-langkah keselamatan yang ketat untuk melindungi data anda, termasuk penyulitan data dan kawalan akses yang ketat.
                </Text>
              </Box>
              <Box>
                <Heading as="h2" size="lg" mb={4}>4. Hak-hak Anda</Heading>
                <Text>
                  Anda mempunyai hak untuk mengakses, membetulkan, atau meminta penghapusan data peribadi anda. Sila hubungi kami untuk sebarang permintaan berkaitan.
                </Text>
              </Box>
            </VStack>
            <Text>
              Dengan menggunakan SukaSamaSuka, anda bersetuju dengan dasar privasi ini. Kami mungkin mengemaskini dasar ini dari semasa ke semasa, jadi sila semak secara berkala.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
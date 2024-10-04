'use client'

import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem } from '@chakra-ui/react'
import SEO from '@/components/SEO'

export default function PrivacyPolicy() {
  return (
    <>
      <SEO 
        title="Dasar Privasi - SukaSamaSuka"
        description="Dasar Privasi SukaSamaSuka - Ketahui bagaimana kami melindungi maklumat peribadi anda dalam platform pertukaran kerja untuk penjawat awam Malaysia."
        keywords={['dasar privasi', 'perlindungan data', 'SukaSamaSuka', 'penjawat awam Malaysia']}
      />
      <Box as="main" minHeight="100vh" bg="gray.50" py={12}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="2xl" textAlign="center">Dasar Privasi</Heading>
            <Text>
              Selamat datang ke Dasar Privasi SukaSamaSuka. Kami menghargai kepercayaan anda dan komited untuk melindungi maklumat peribadi anda.
            </Text>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="lg">1. Maklumat yang Kami Kumpul</Heading>
              <Text>
                Kami mengumpul maklumat berikut:
              </Text>
              <UnorderedList pl={4}>
                <ListItem>Maklumat peribadi seperti nama, alamat e-mel, dan nombor telefon</ListItem>
                <ListItem>Maklumat pekerjaan termasuk jawatan semasa dan lokasi</ListItem>
                <ListItem>Pilihan pertukaran kerja yang anda nyatakan</ListItem>
              </UnorderedList>
            </VStack>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="lg">2. Penggunaan Maklumat</Heading>
              <Text>
                Kami menggunakan maklumat anda untuk:
              </Text>
              <UnorderedList pl={4}>
                <ListItem>Memadankan anda dengan peluang pertukaran kerja yang sesuai</ListItem>
                <ListItem>Menambah baik perkhidmatan kami</ListItem>
                <ListItem>Berkomunikasi dengan anda mengenai akaun dan perkhidmatan kami</ListItem>
              </UnorderedList>
            </VStack>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="lg">3. Perlindungan Data</Heading>
              <Text>
                Kami mengambil langkah-langkah keselamatan yang ketat untuk melindungi data anda, termasuk penyulitan data dan kawalan akses yang ketat.
              </Text>
            </VStack>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="lg">4. Hak-hak Anda</Heading>
              <Text>
                Anda mempunyai hak untuk mengakses, membetulkan, atau meminta penghapusan data peribadi anda. Sila hubungi kami untuk sebarang permintaan berkaitan.
              </Text>
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
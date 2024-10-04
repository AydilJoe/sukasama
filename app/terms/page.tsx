'use client'

import { Box, Container, Heading, Text, VStack, OrderedList, ListItem } from '@chakra-ui/react'
import SEO from '@/components/SEO'

export default function TermsOfUse() {
  return (
    <>
      <SEO 
        title="Terma Penggunaan - SukaSamaSuka"
        description="Terma Penggunaan SukaSamaSuka - Fahami syarat dan peraturan penggunaan platform pertukaran kerja untuk penjawat awam Malaysia."
        keywords={['terma penggunaan', 'syarat perkhidmatan', 'SukaSamaSuka', 'penjawat awam Malaysia']}
      />
      <Box as="main" minHeight="100vh" bg="gray.50" py={12}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="2xl" textAlign="center">Terma Penggunaan</Heading>
            <Text>
              Selamat datang ke SukaSamaSuka. Dengan menggunakan platform kami, anda bersetuju untuk mematuhi terma penggunaan berikut:
            </Text>
            <OrderedList spacing={4} pl={4}>
              <ListItem>
                <Text fontWeight="bold">Kelayakan</Text>
                <Text>Anda mesti merupakan penjawat awam Malaysia yang sah untuk menggunakan perkhidmatan kami.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Penggunaan Akaun</Text>
                <Text>Anda bertanggungjawab untuk mengekalkan kerahsiaan kata laluan akaun anda dan untuk semua aktiviti yang berlaku di bawah akaun anda.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Maklumat Tepat</Text>
                <Text>Anda bersetuju untuk memberikan maklumat yang tepat dan terkini dalam profil dan pos kerja anda.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Tingkah Laku Pengguna</Text>
                <Text>Anda bersetuju untuk tidak menggunakan perkhidmatan kami untuk sebarang tujuan yang menyalahi undang-undang atau tidak beretika.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Hak Harta Intelek</Text>
                <Text>Semua kandungan dan perkhidmatan di SukaSamaSuka adalah hak milik kami dan dilindungi oleh undang-undang hak cipta.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Penafian</Text>
                <Text>Kami tidak menjamin bahawa perkhidmatan kami akan sentiasa tersedia atau bebas daripada kesalahan.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">Perubahan Terma</Text>
                <Text>Kami berhak untuk mengubah terma penggunaan ini pada bila-bila masa. Perubahan akan berkuat kuasa sebaik sahaja diposkan di platform.</Text>
              </ListItem>
            </OrderedList>
            <Text>
              Jika anda mempunyai sebarang pertanyaan mengenai Terma Penggunaan ini, sila hubungi kami melalui halaman Hubungi Kami.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
'use client'

import { Box, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import SEO from '@/components/SEO'

export default function TermsOfUse() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const headingColor = useColorModeValue('blue.600', 'blue.300')

  const terms = [
    {
      title: "Kelayakan",
      content: "Anda mesti merupakan penjawat awam Malaysia yang sah untuk menggunakan perkhidmatan kami."
    },
    {
      title: "Penggunaan Akaun",
      content: "Anda bertanggungjawab untuk mengekalkan kerahsiaan kata laluan akaun anda dan untuk semua aktiviti yang berlaku di bawah akaun anda."
    },
    {
      title: "Maklumat Tepat",
      content: "Anda bersetuju untuk memberikan maklumat yang tepat dan terkini dalam profil dan pos kerja anda."
    },
    {
      title: "Tingkah Laku Pengguna",
      content: "Anda bersetuju untuk tidak menggunakan perkhidmatan kami untuk sebarang tujuan yang menyalahi undang-undang atau tidak beretika."
    },
    {
      title: "Hak Harta Intelek",
      content: "Semua kandungan dan perkhidmatan di SukaSamaSuka adalah hak milik kami dan dilindungi oleh undang-undang hak cipta."
    },
    {
      title: "Penafian",
      content: "Kami tidak menjamin bahawa perkhidmatan kami akan sentiasa tersedia atau bebas daripada kesalahan."
    },
    {
      title: "Perubahan Terma",
      content: "Kami berhak untuk mengubah terma penggunaan ini pada bila-bila masa. Perubahan akan berkuat kuasa sebaik sahaja diposkan di platform."
    }
  ]

  return (
    <>
      <SEO 
        title="Terma Penggunaan - SukaSamaSuka"
        description="Terma Penggunaan SukaSamaSuka - Fahami syarat dan peraturan penggunaan platform pertukaran kerja untuk penjawat awam Malaysia."
        keywords={['terma penggunaan', 'syarat perkhidmatan', 'SukaSamaSuka', 'penjawat awam Malaysia']}
      />
      <Box as="main" minHeight="100vh" bg={bgColor} py={12}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch" bg={cardBgColor} p={8} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
            <Heading as="h1" size="2xl" textAlign="center" color={headingColor} mb={6}>
              Terma Penggunaan
            </Heading>
            <Text fontSize="lg" mb={6} color={textColor}>
              Selamat datang ke SukaSamaSuka. Dengan menggunakan platform kami, anda bersetuju untuk mematuhi terma penggunaan berikut:
            </Text>
            <VStack spacing={6} align="stretch">
              {terms.map((term, index) => (
                <Box key={index}>
                  <Heading as="h2" size="md" color={headingColor} mb={2}>
                    {index + 1}. {term.title}
                  </Heading>
                  <Text color={textColor}>{term.content}</Text>
                </Box>
              ))}
            </VStack>
            <Text mt={6} fontSize="sm" color={textColor}>
              Jika anda mempunyai sebarang pertanyaan mengenai Terma Penggunaan ini, sila hubungi kami melalui halaman Hubungi Kami.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
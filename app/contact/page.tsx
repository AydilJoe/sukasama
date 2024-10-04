'use client'

import { useState } from 'react'
import { Box, Container, Heading, Text, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast } from '@chakra-ui/react'
import SEO from '@/components/SEO'

export default function ContactUs() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Here you would typically send the form data to your backend
    // For this example, we'll just simulate a submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      title: 'Mesej dihantar',
      description: 'Terima kasih kerana menghubungi kami. Kami akan membalas secepat mungkin.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })

    setName('')
    setEmail('')
    setMessage('')
    setIsSubmitting(false)
  }

  return (
    <>
      <SEO 
        title="Hubungi Kami - SukaSamaSuka"
        description="Hubungi SukaSamaSuka - Kami sedia membantu anda dengan sebarang pertanyaan mengenai platform pertukaran kerja untuk penjawat awam Malaysia."
        keywords={['hubungi kami', 'bantuan', 'sokongan', 'SukaSamaSuka', 'penjawat awam Malaysia']}
      />
      <Box as="main" minHeight="100vh" bg="gray.50" py={12}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="2xl" textAlign="center">Hubungi Kami</Heading>
            <Text textAlign="center">
              Kami sedia membantu anda. Sila isi borang di bawah dan kami akan menghubungi anda secepat mungkin.
            </Text>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="name">Nama</FormLabel>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nama anda"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="email">E-mel</FormLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="alamat@emel.com"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="message">Mesej</FormLabel>
                  <Textarea 
                    id="message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Tulis mesej anda di sini"
                    rows={5}
                  />
                </FormControl>
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isSubmitting}
                  loadingText="Menghantar..."
                >
                  Hantar Mesej
                </Button>
              </VStack>
            </Box>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="lg">Maklumat Hubungan</Heading>
              <Text>E-mel: sukasamasukamy@gmail.com</Text>
              <Text>Telefon: +60 17 - 6890159</Text>
              <Text>Alamat: Jalan Perdana, 50088 Kuala Lumpur, Malaysia</Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
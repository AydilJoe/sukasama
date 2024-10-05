import { Box, Container, Heading } from '@chakra-ui/react'
import ValidateSender from '@/components/ValidateSender'

export default function ValidateSenderPage() {
  return (
    <Container maxW="container.md" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl">Validate Sender</Heading>
      </Box>
      <ValidateSender />
    </Container>
  )
}
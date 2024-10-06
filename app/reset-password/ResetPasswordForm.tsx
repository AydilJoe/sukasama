'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const toast = useToast()

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    validatePassword(password)
  }, [password])

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const doPasswordsMatch = password === confirmPassword

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isPasswordValid) {
        throw new Error('Please meet all password requirements')
      }
      if (!doPasswordsMatch) {
        throw new Error('Passwords do not match')
      }

      const token_hash = searchParams?.get('token_hash')

      if (!token_hash) {
        throw new Error('Missing token_hash in URL')
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      })

      if (verifyError) throw verifyError

      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) throw updateError

      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated. You can now log in with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      router.push('/')
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        title: 'Password reset failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="md" centerContent>
      <Box padding="6" bg="white" boxShadow="md" borderRadius="md" width="100%" mt="8">
        <VStack spacing="6">
          <Heading as="h1" size="xl" color="gray.800">
            Reset Password
          </Heading>
          <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
            <VStack spacing="4">
              <FormControl isRequired>
                <FormLabel htmlFor="password" color="gray.700">New Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    color="gray.800"
                    borderColor="gray.300"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="confirmPassword" color="gray.700">Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    color="gray.800"
                    borderColor="gray.300"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Box width="100%">
                <Text fontWeight="medium" mb="2" color="gray.700">
                  Password must contain:
                </Text>
                <List spacing={1}>
                  {Object.entries(passwordValidation).map(([key, valid]) => (
                    <ListItem key={key} color={valid ? "green.500" : "red.500"}>
                      <ListIcon
                        as={valid ? CheckIcon : CloseIcon}
                        color={valid ? 'green.500' : 'red.500'}
                      />
                      {key === 'length'
                        ? 'At least 8 characters'
                        : key === 'uppercase'
                        ? 'At least one uppercase letter'
                        : key === 'lowercase'
                        ? 'At least one lowercase letter'
                        : key === 'number'
                        ? 'At least one number'
                        : 'At least one special character'}
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={loading}
                loadingText="Resetting Password"
                isDisabled={!isPasswordValid || !doPasswordsMatch}
              >
                Reset Password
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  List,
  ListItem,
  ListIcon,
  FormErrorMessage,
  Container,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

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

      const token = searchParams?.get('token')
      if (!token) {
        throw new Error('Reset token is missing')
      }

      const { error } = await supabase.auth.updateUser({ password: password })

      if (error) throw error

      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      router.push('/login')
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" centerContent>
      <Box width="100%" py={8}>
        <Card>
          <CardBody>
            <form onSubmit={handleResetPassword}>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">
                  Reset Password
                </Heading>
                <Text textAlign="center">
                  Enter your new password below.
                </Text>
                <FormControl isRequired>
                  <FormLabel htmlFor="password">New Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl isRequired isInvalid={!doPasswordsMatch && confirmPassword !== ''}>
                  <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>Passwords do not match</FormErrorMessage>
                </FormControl>
                <List spacing={1} fontSize="sm">
                  {Object.entries(passwordValidation).map(([key, valid]) => (
                    <ListItem key={key}>
                      <ListIcon as={valid ? CheckIcon : CloseIcon} color={valid ? "green.500" : "red.500"} />
                      {key === 'length' ? 'At least 8 characters' : 
                       key === 'uppercase' ? 'Contains uppercase letter' :
                       key === 'lowercase' ? 'Contains lowercase letter' :
                       key === 'number' ? 'Contains number' :
                       'Contains special character'}
                    </ListItem>
                  ))}
                </List>
                <Button
                  type="submit"
                  isLoading={loading}
                  loadingText="Resetting Password..."
                  colorScheme="blue"
                  isDisabled={!isPasswordValid || !doPasswordsMatch}
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Container>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [resetEmail, setResetEmail] = useState('')
  const router = useRouter()

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

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (!isPasswordValid) {
          throw new Error('Please meet all password requirements')
        }
        if (!doPasswordsMatch) {
          throw new Error('Passwords do not match')
        }
      }

      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      const { error, data } = result

      if (error) throw error

      if (isSignUp) {
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        // Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user?.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (!profileData) {
          // Insert user email into profile table
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: data.user?.id, email: data.user?.email })

          if (insertError) throw insertError
        }

        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        // Redirect to home page
        router.push('/')
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast({
        title: "Password reset email sent",
        description: "Please check your email for further instructions.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Failed to send reset email",
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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={4}>
      <form onSubmit={handleAuth}>
        <VStack spacing={4} align="stretch" width="300px">
          <Heading as="h1" size="xl" textAlign="center">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Heading>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          {isSignUp && (
            <>
              <FormControl isRequired isInvalid={!doPasswordsMatch && confirmPassword !== ''}>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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
            </>
          )}
          <Button
            type="submit"
            isLoading={loading}
            loadingText={isSignUp ? "Signing up..." : "Logging in..."}
            colorScheme="blue"
            isDisabled={isSignUp && (!isPasswordValid || !doPasswordsMatch)}
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
          <Text textAlign="center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            {" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setPassword('')
                setConfirmPassword('')
              }}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </Button>
          </Text>
          {!isSignUp && (
            <Button variant="link" colorScheme="blue" onClick={onOpen}>
              Forgot Password?
            </Button>
          )}
        </VStack>
      </form>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleResetPassword} isLoading={loading}>
              Send Reset Email
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
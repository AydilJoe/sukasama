'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const toast = useToast()

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      const { error } = result

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
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
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

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
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
          <Button
            type="submit"
            isLoading={loading}
            loadingText={isSignUp ? "Signing up..." : "Logging in..."}
            colorScheme="blue"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
          <Text textAlign="center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            {" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  )
}
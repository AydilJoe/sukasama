'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Heading,
  useToast,
  useColorModeValue,
  Container,
  Text,
  Input,
  SimpleGrid,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
} from '@chakra-ui/react'
import { jobGrades } from '@/data/jobGrades'
import { ChevronDownIcon } from '@chakra-ui/icons'

const malaysiaStatesAndDistricts: { [key: string]: string[] } = {
  Johor: ['Johor Bahru', 'Batu Pahat', 'Muar', 'Kluang', 'Segamat', 'Pontian', 'Kota Tinggi', 'Mersing', 'Kulai', 'Tangkak'],
  Kedah: ['Kota Setar', 'Kuala Muda', 'Kulim', 'Langkawi', 'Yan', 'Sik', 'Padang Terap', 'Pendang', 'Bandar Baharu', 'Baling', 'Kubang Pasu'],
  Kelantan: ['Kota Bharu', 'Pasir Mas', 'Tumpat', 'Pasir Puteh', 'Bachok', 'Kuala Krai', 'Machang', 'Tanah Merah', 'Jeli', 'Gua Musang'],
  Melaka: ['Melaka Tengah', 'Alor Gajah', 'Jasin'],
  'Negeri Sembilan': ['Seremban', 'Port Dickson', 'Rembau', 'Tampin', 'Jempol', 'Kuala Pilah', 'Jelebu'],
  Pahang: ['Kuantan', 'Temerloh', 'Bentong', 'Maran', 'Rompin', 'Pekan', 'Bera', 'Raub', 'Jerantut', 'Lipis', 'Cameron Highlands'],
  Perak: ['Kinta', 'Larut, Matang dan Selama', 'Hilir Perak', 'Manjung', 'Kerian', 'Batang Padang', 'Kuala Kangsar', 'Hulu Perak', 'Perak Tengah', 'Kampar'],
  Perlis: ['Kangar'],
  'Pulau Pinang': ['Timur Laut', 'Barat Daya', 'Seberang Perai Utara', 'Seberang Perai Tengah', 'Seberang Perai Selatan'],
  Sabah: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau', 'Kinabatangan', 'Semporna', 'Papar', 'Penampang', 'Kudat'],
  Sarawak: ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang', 'Sarikei', 'Kapit', 'Sri Aman', 'Samarahan', 'Betong'],
  Selangor: ['Petaling', 'Hulu Langat', 'Klang', 'Gombak', 'Kuala Langat', 'Sepang', 'Kuala Selangor', 'Hulu Selangor', 'Sabak Bernam'],
  Terengganu: ['Kuala Terengganu', 'Kemaman', 'Dungun', 'Marang', 'Hulu Terengganu', 'Besut', 'Setiu', 'Kuala Nerus'],
  'Wilayah Persekutuan Kuala Lumpur': ['Kuala Lumpur'],
  'Wilayah Persekutuan Labuan': ['Labuan'],
  'Wilayah Persekutuan Putrajaya': ['Putrajaya'],
}

interface JobPostFormProps {
  onPostCreated: () => void;
}

export default function JobPostForm({ onPostCreated }: JobPostFormProps) {
  const [jobNameInput, setJobNameInput] = useState('')
  const [jobName, setJobName] = useState('')
  const [jobGrade, setJobGrade] = useState('')
  const [currentState, setCurrentState] = useState('')
  const [currentDistrict, setCurrentDistrict] = useState('')
  const [expectedState, setExpectedState] = useState('')
  const [expectedDistrict, setExpectedDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [showJobSuggestions, setShowJobSuggestions] = useState(false)
  const toast = useToast()

  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headingColor = useColorModeValue('purple.700', 'purple.300')
  const inputBgColor = useColorModeValue('white', 'gray.700')
  const suggestionBgColor = useColorModeValue('gray.100', 'gray.700')
  const suggestionHoverBgColor = useColorModeValue('gray.200', 'gray.600')

  const uniqueJobNames = useMemo(() => {
    const names = Array.from(new Set(jobGrades.map(job => job.name)))
    return names.sort((a, b) => a.localeCompare(b))
  }, [])

  const filteredJobNames = useMemo(() => {
    return uniqueJobNames.filter(name => 
      name.toLowerCase().includes(jobNameInput.toLowerCase())
    )
  }, [uniqueJobNames, jobNameInput])

  const states = useMemo(() => Object.keys(malaysiaStatesAndDistricts), [])

  useEffect(() => {
    setExpectedDistrict('')
  }, [expectedState])

  useEffect(() => {
    if (expectedState === currentState && expectedDistrict === currentDistrict) {
      setExpectedDistrict('')
    }
  }, [currentState, currentDistrict, expectedState, expectedDistrict])

  const expectedDistrictOptions = useMemo(() => {
    if (expectedState && malaysiaStatesAndDistricts[expectedState]) {
      if (expectedState === currentState) {
        return malaysiaStatesAndDistricts[expectedState].filter((district: string) => district !== currentDistrict)
      }
      return malaysiaStatesAndDistricts[expectedState]
    }
    return []
  }, [expectedState, currentState, currentDistrict])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!jobName) {
      toast({
        title: "Error",
        description: "Please select a valid job name from the list.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existingPosts, error: fetchError } = await supabase
          .from('job_posts')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        if (existingPosts && existingPosts.length >= 3) {
          const oldestPost = existingPosts[0]
          const { error: deleteError } = await supabase
            .from('job_posts')
            .delete()
            .eq('id', oldestPost.id)

          if (deleteError) throw deleteError

          toast({
            title: "Oldest post deleted",
            description: "Your oldest post was deleted to make room for the new one.",
            status: "info",
            duration: 5000,
            isClosable: true,
          })
        }

        const { error: insertError } = await supabase.from('job_posts').insert({
          job_name: jobName,
          job_grade: jobGrade,
          current_location: `${currentState}, ${currentDistrict}`,
          expected_location: `${expectedState}, ${expectedDistrict}`,
          user_id: user.id,
        })

        if (insertError) throw insertError

        toast({
          title: "Job post created",
          description: "Your job post has been created successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

        setJobNameInput('')
        setJobName('')
        setJobGrade('')
        setCurrentState('')
        setCurrentDistrict('')
        setExpectedState('')
        setExpectedDistrict('')

        onPostCreated()
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      toast({
        title: "Error",
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
    <Box 
      as="form" 
      onSubmit={handleSubmit} 
      bg={cardBgColor} 
      borderRadius="lg" 
      borderWidth={1} 
      borderColor={borderColor} 
      p={8}
      boxShadow="lg"
    >
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Heading as="h2" size="lg" color={headingColor} textAlign="center" mb={4}>Post a Job</Heading>
          <Heading as="h3" size="l" color={headingColor} textAlign="center" mb={0}>Max 3 Post</Heading>
          <FormControl isRequired position="relative">
            <FormLabel htmlFor="jobName">Job Name</FormLabel>
            <InputGroup>
              <Input
                id="jobName"
                value={jobNameInput}
                onChange={(e) => {
                  setJobNameInput(e.target.value)
                  setShowJobSuggestions(true)
                }}
                onFocus={() => setShowJobSuggestions(true)}
                onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                placeholder="Type to search job name"
                bg={inputBgColor}
                size="md"
                autoComplete="off"
              />
              <InputRightElement>
                <ChevronDownIcon />
              </InputRightElement>
            </InputGroup>
            {showJobSuggestions && filteredJobNames.length > 0 && (
              <List
                position="absolute"
                zIndex={1}
                w="100%"
                bg={suggestionBgColor}
                borderRadius="md"
                boxShadow="md"
                mt={1}
                maxH="200px"
                overflowY="auto"
              >
                {filteredJobNames.map((name, index) => (
                  <ListItem
                    key={index}
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: suggestionHoverBgColor }}
                    onClick={() => {
                      setJobNameInput(name)
                      setJobName(name)
                      setShowJobSuggestions(false)
                    }}
                  >
                    {name}
                  </ListItem>
                ))}
              </List>
            )}
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="jobGrade">Job Grade</FormLabel>
            <Select
              id="jobGrade"
              value={jobGrade}
              onChange={(e) => setJobGrade(e.target.value)}
              placeholder="Select job grade"
              isDisabled={!jobName}
              bg={inputBgColor}
              size="md"
            >
              {jobGrades
                .filter(job => job.name === jobName)
                .map((job, index) => (
                  <option key={index} value={job.grade}>{job.grade}</option>
                ))}
            </Select>
          </FormControl>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>Current Location</Text>
              <FormControl isRequired>
                <FormLabel htmlFor="currentState">State</FormLabel>
                <Select
                  id="currentState"
                  value={currentState}
                  onChange={(e) => {
                    setCurrentState(e.target.value)
                    setCurrentDistrict('')
                  }}
                  placeholder="Select state"
                  bg={inputBgColor}
                  size="md"
                >
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel htmlFor="currentDistrict">District</FormLabel>
                <Select
                  id="currentDistrict"
                  value={currentDistrict}
                  onChange={(e) => setCurrentDistrict(e.target.value)}
                  placeholder="Select district"
                  isDisabled={!currentState}
                  bg={inputBgColor}
                  size="md"
                >
                  {currentState && malaysiaStatesAndDistricts[currentState].map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Expected Location</Text>
              <FormControl isRequired>
                <FormLabel htmlFor="expectedState">State</FormLabel>
                <Select
                  id="expectedState"
                  value={expectedState}
                  onChange={(e) => {
                    setExpectedState(e.target.value)
                    setExpectedDistrict('')
                  }}
                  placeholder="Select state"
                  isDisabled={!currentState}
                  bg={inputBgColor}
                  size="md"
                >
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel htmlFor="expectedDistrict">District</FormLabel>
                <Select
                  id="expectedDistrict"
                  value={expectedDistrict}
                  onChange={(e) => setExpectedDistrict(e.target.value)}
                  placeholder="Select district"
                  isDisabled={!expectedState || (expectedState === currentState && expectedDistrict === currentDistrict)}
                  bg={inputBgColor}
                  size="md"
                >
                  {expectedDistrictOptions.map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </SimpleGrid>
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Posting..."
            colorScheme="purple"
            size="lg"
            width="full"
            mt={4}
          >
            Post Job
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
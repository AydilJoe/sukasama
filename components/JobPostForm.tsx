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
  Grid,
  GridItem,
  useToast,
  useColorModeValue,
  Container,
  Text,
  Input,
} from '@chakra-ui/react'
import { jobGrades } from '@/data/jobGrades'

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
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headingColor = useColorModeValue('purple.700', 'purple.300')
  const subHeadingColor = useColorModeValue('teal.600', 'teal.300')
  const inputBgColor = useColorModeValue('white', 'gray.700')

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
    <Box bg={bgColor} py={4}>
      <Container maxW="container.md">
        <Box 
          as="form" 
          onSubmit={handleSubmit} 
          bg={cardBgColor} 
          borderRadius="lg" 
          borderWidth={1} 
          borderColor={borderColor} 
          p={6}
          boxShadow="md"
        >
          <VStack spacing={4} align="stretch">
            <Heading as="h2" size="lg" color={headingColor} textAlign="center" mb={2}>Post a Job</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={2}>
                <FormControl isRequired>
                  <FormLabel htmlFor="jobName">Job Name</FormLabel>
                  <Input
                    id="jobName"
                    value={jobNameInput}
                    onChange={(e) => {
                      setJobNameInput(e.target.value)
                      setJobName('')
                      setJobGrade('')
                    }}
                    placeholder="Type to search job name"
                    bg={inputBgColor}
                    size="sm"
                  />
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl isRequired>
                  <FormLabel htmlFor="jobNameSelect">Select Job Name</FormLabel>
                  <Select
                    id="jobNameSelect"
                    value={jobName}
                    onChange={(e) => {
                      setJobName(e.target.value)
                      setJobGrade('')
                    }}
                    placeholder="Select job name"
                    bg={inputBgColor}
                    size="sm"
                  >
                    {filteredJobNames.map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl isRequired>
                  <FormLabel htmlFor="jobGrade">Job Grade</FormLabel>
                  <Select
                    id="jobGrade"
                    value={jobGrade}
                    onChange={(e) => setJobGrade(e.target.value)}
                    placeholder="Select job grade"
                    isDisabled={!jobName}
                    bg={inputBgColor}
                    size="sm"
                  >
                    {jobGrades
                      .filter(job => job.name === jobName)
                      .map((job, index) => (
                        <option key={index} value={job.grade}>{job.grade}</option>
                      ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold" color={subHeadingColor} fontSize="sm">Current Location</Text>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel htmlFor="currentState" fontSize="sm">State</FormLabel>
                  <Select
                    id="currentState"
                    value={currentState}
                    onChange={(e) => {
                      setCurrentState(e.target.value)
                      setCurrentDistrict('')
                    }}
                    placeholder="Select state"
                    bg={inputBgColor}
                    size="sm"
                  >
                    {states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel htmlFor="currentDistrict" fontSize="sm">District</FormLabel>
                  <Select
                    id="currentDistrict"
                    value={currentDistrict}
                    onChange={(e) => setCurrentDistrict(e.target.value)}
                    placeholder="Select district"
                    isDisabled={!currentState}
                    bg={inputBgColor}
                    size="sm"
                  >
                    {currentState && malaysiaStatesAndDistricts[currentState].map((district, index) => (
                      <option key={index} value={district}>{district}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold" color={subHeadingColor} fontSize="sm">Expected Location</Text>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel htmlFor="expectedState" fontSize="sm">State</FormLabel>
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
                    size="sm"
                  >
                    {states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel htmlFor="expectedDistrict" fontSize="sm">District</FormLabel>
                  <Select
                    id="expectedDistrict"
                    value={expectedDistrict}
                    onChange={(e) => setExpectedDistrict(e.target.value)}
                    placeholder="Select district"
                    isDisabled={!expectedState || (expectedState === currentState && expectedDistrict === currentDistrict)}
                    bg={inputBgColor}
                    size="sm"
                  >
                    {expectedDistrictOptions.map((district, index) => (
                      <option key={index} value={district}>{district}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Posting..."
              colorScheme="purple"
              size="md"
              width="full"
              mt={2}
            >
              Post Job
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
'use client'

import { Button } from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.log('Error logging out:', error.message)
  }

  return (
    <Button onClick={handleLogout} colorScheme="blue" variant="outline">
      Log Out
    </Button>
  )
}
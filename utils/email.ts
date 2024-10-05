export async function sendEmail(to: string, subject: string, text: string, html: string) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text, html }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
  
      return await response.json()
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
import Mailjet from 'node-mailjet'

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET
})

interface MailjetSender {
  Email: string
  Name: string
  ID: number
}

interface MailjetResponse {
  Count: number
  Data: MailjetSender[]
  Total: number
}

export async function sendJobMatchEmail(recipientEmail: string, jobName: string, jobGrade: string, matchCount: number) {
  const senderEmail = 'aydil@suka-sama-suka.com'

  try {
    // Validate sender email
    const isValid = await validateSenderEmail(senderEmail)
    if (!isValid) {
      throw new Error('Sender email is not validated')
    }

    const response = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: 'SukaSamaSuka Job Match'
            },
            To: [
              {
                Email: recipientEmail
              }
            ],
            Subject: 'New Job Match Found!',
            TextPart: `We've found ${matchCount} new match(es) for your job post: ${jobName} (${jobGrade})`,
            HTMLPart: `
              <h3>New Job Match Found!</h3>
              <p>We've found ${matchCount} new match(es) for your job post:</p>
              <p><strong>${jobName}</strong> (${jobGrade})</p>
              <p>Log in to your account to view the matches and connect with potential candidates!</p>
            `
          }
        ]
      })

    console.log('Email sent successfully:', response.body)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

async function validateSenderEmail(email: string): Promise<boolean> {
  try {
    const response = await mailjet
      .get('sender')
      .request()

    // Use a type assertion to treat the response body as unknown first
    const mailjetResponse = (response.body as unknown) as MailjetResponse
    const senders = mailjetResponse.Data

    const isValidSender = senders.some(sender => 
      sender.Email.toLowerCase() === email.toLowerCase() && sender.Name === 'SukaSamaSuka Job Match'
    )

    if (!isValidSender) {
      console.log('Sender email not found. Attempting to create...')
      await createSender(email)
      return true
    }

    return true
  } catch (error) {
    console.error('Error validating sender email:', error)
    return false
  }
}

async function createSender(email: string): Promise<void> {
  try {
    const response = await mailjet
      .post('sender')
      .request({
        Email: email,
        Name: 'SukaSamaSuka Job Match'
      })

    console.log('Sender created successfully:', response.body)
  } catch (error) {
    console.error('Error creating sender:', error)
    throw error
  }
}
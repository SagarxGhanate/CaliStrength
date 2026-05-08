export async function sendEmail({ to_email, subject, message }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured in .env.local. Emails will not be sent.')
    console.log(`[Mock Email] To: ${to_email} | Subject: ${subject}\nMessage:\n${message}`)
    return
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email,
          subject,
          message,
        }
      })
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Failed to send email:', text)
    }
  } catch (err) {
    console.error('Email sending error:', err)
  }
}

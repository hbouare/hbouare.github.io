// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, email, message } = body || {}

  // Validate fields
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address.' })
  }

  // --- Send via external service ---
  // Option A: Resend (uncomment and add RESEND_API_KEY to .env)
  // const resendKey = process.env.RESEND_API_KEY
  // if (resendKey) {
  //   await $fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
  //     body: {
  //       from: 'Portfolio <contact@yourdomain.com>',
  //       to: ['your-email@example.com'],
  //       subject: `[Portfolio] Message from ${name}`,
  //       text: `From: ${name} (${email})\n\n${message}`,
  //     },
  //   })
  // }

  // Option B: Formspree / Getform (uncomment and set URL)
  // await $fetch('https://formspree.io/f/YOUR_FORM_ID', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: { name, email, message },
  // })

  // For now: log to server console (works in dev, replace with real service in prod)
  console.log('[Contact Form]', { name, email, message: message.substring(0, 200) })

  return { success: true }
})

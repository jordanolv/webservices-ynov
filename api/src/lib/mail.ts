/**
 * Envoi email via Brevo API (transactionnel)
 */
async function sendBrevo(payload: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const key = process.env.BREVO_API_KEY
  if (!key) {
    console.log('[Mail] BREVO_API_KEY absent, skip:', payload.subject)
    return true
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM || 'noreply@dylanolivier.fr', name: 'Dylan Olivier' },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
      replyTo: payload.replyTo ? { email: payload.replyTo } : undefined,
    }),
  })
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
  return true
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendOrderConfirmation(order: { orderNumber: string; customer: { email: string }; totalAmount: number }): Promise<void> {
  await sendBrevo({
    to: order.customer.email,
    subject: `Confirmation commande ${order.orderNumber}`,
    html: `<p>Merci pour votre commande ${escape(order.orderNumber)}. Montant: ${order.totalAmount}€.</p>`,
  })
}

export async function sendAdminOrderNotification(order: { orderNumber: string; customer: { name: string; email: string }; totalAmount: number }): Promise<void> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return
  await sendBrevo({
    to,
    subject: `Nouvelle commande ${order.orderNumber}`,
    html: `<p>Commande ${escape(order.orderNumber)} - ${escape(order.customer.name)} (${escape(order.customer.email)}) - ${order.totalAmount}€</p>`,
  })
}

export async function sendContact(data: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<void> {
  const to = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL
  if (!to) throw new Error('CONTACT_EMAIL or ADMIN_EMAIL required')
  await sendBrevo({
    to,
    subject: `[Contact] ${escape(data.subject)}`,
    replyTo: data.email,
    html: `
      <p><strong>De:</strong> ${escape(data.name)} (${escape(data.email)})</p>
      ${data.phone ? `<p><strong>Tél:</strong> ${escape(data.phone)}</p>` : ''}
      <p><strong>Message:</strong></p>
      <pre>${escape(data.message)}</pre>
    `,
  })
}

import { sendContact } from '../lib/mail.js'
import type { ContactInput } from '../validators/contact.js'

export async function send(data: ContactInput) {
  await sendContact(data)
}

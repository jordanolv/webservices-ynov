import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/mail.js', () => ({
  sendContact: vi.fn(),
}))

import * as service from '../contact.service.js'
import { sendContact } from '../../lib/mail.js'

beforeEach(() => vi.clearAllMocks())

describe('contact.service', () => {
  it('delegates to sendContact', async () => {
    const data = {
      name: 'Jordan',
      email: 'jordan@test.com',
      subject: 'Question',
      message: 'Hello',
    }

    await service.send(data)

    expect(sendContact).toHaveBeenCalledWith(data)
  })
})

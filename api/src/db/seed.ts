/**
 * Seed admin user - run: npx tsx src/db/seed.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from './models/user.js'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/animaux'

async function seed() {
  await mongoose.connect(uri)
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_SEED_PASSWORD || 'admin123'
  const existing = await User.findOne({ email })
  if (existing) {
    console.log('Admin existe déjà:', email)
  } else {
    await User.create({ email, password, fullName: 'Admin' })
    console.log('Admin créé:', email)
  }
  await mongoose.disconnect()
}

seed().catch(console.error)

import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/animaux'

export async function connectDb(): Promise<void> {
  await mongoose.connect(uri)
}

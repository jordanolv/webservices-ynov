import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  fullName: string
  checkPassword(plain: string): Promise<boolean>
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.checkPassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)

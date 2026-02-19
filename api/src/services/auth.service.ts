import { User } from '../db/models/user.js'
import { AppError } from '../types/index.js'
import { signToken, verifyToken } from '../middleware/auth.js'
import type { LoginInput, SignupInput } from '../validators/auth.js'

export async function signup(data: SignupInput) {
  const normalizedEmail = data.email.toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) throw new AppError(400, 'Un compte existe déjà avec cet email')

  await User.create({ email: normalizedEmail, password: data.password, fullName: data.fullName })
}

export async function login(data: LoginInput) {
  const user = await User.findOne({ email: data.email.toLowerCase() })
  if (!user || !(await user.checkPassword(data.password))) {
    throw new AppError(401, 'Email ou mot de passe incorrect')
  }

  const token = await signToken(user._id.toString())
  return { id: user._id, email: user.email, token }
}

export async function getMe(token: string) {
  const data = await verifyToken(token)
  if (!data) throw new AppError(401, 'Session expirée')

  const user = await User.findById(data.userId).select('-password').lean()
  if (!user) throw new AppError(401, 'Utilisateur introuvable')
  return user
}

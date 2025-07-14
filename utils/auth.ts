import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

// Hachage du mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

// Vérification du mot de passe
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// Génération du token JWT
export const generateToken = (userId: string, secret: string): string => {
  return jwt.sign(
    { userId, type: 'access' },
    secret,
    { expiresIn: '7d' }
  )
}

// Vérification du token JWT
export const verifyToken = (token: string, secret: string): { userId: string; type: string } | null => {
  try {
    return jwt.verify(token, secret) as { userId: string; type: string }
  } catch (error) {
    return null
  }
}

// Génération d'un token de réinitialisation de mot de passe
export const generateResetToken = (): string => {
  return uuidv4()
}

// Génération d'un token de vérification d'email
export const generateVerificationToken = (): string => {
  return uuidv4()
}

// Validation de l'email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validation du mot de passe
export const isValidPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validation du nom d'utilisateur
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

// Nettoyage des données utilisateur pour l'API
export const sanitizeUserData = (user: any) => {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}

// Génération d'une date d'expiration
export const generateExpirationDate = (minutes: number = 60): Date => {
  const now = new Date()
  return new Date(now.getTime() + minutes * 60 * 1000)
}

// Vérification si un token a expiré
export const isTokenExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate
}

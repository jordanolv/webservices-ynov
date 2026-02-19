/**
 * Charge les variables d'environnement AVANT tout autre import.
 * En prod : .env.prod | En dev : .env
 */
import { config } from 'dotenv'

config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env' })

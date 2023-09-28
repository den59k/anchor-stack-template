import crypto from 'crypto'
import { promisify } from 'util'

export const generateHash = (pass: string): Promise<Buffer> => {
  return promisify(crypto.scrypt)(pass, "curves", 64) as Promise<Buffer>
}
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import crypto from 'crypto'

const SECRET = 'AIZON´API-REST'

export const random = () => crypto.randomBytes(128).toString('base64')
export const authentication = (salt: string | null, password: string | undefined) => {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET).digest('hex')
}

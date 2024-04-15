/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'

import { login, register } from '../controllers/authentication'

// const router = express.Router()

export default (router: express.Router) => {
  router.post('/auth/register', register)
  router.post('/auth/login', login)
}

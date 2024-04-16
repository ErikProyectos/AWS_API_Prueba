import express from 'express'

import authentication from './authentication'
import users from './users'
import solutions from './solutions'
import screens from './screens'

const router = express.Router()

export default (): express.Router => {
  authentication(router)
  users(router)
  solutions(router)
  screens(router)
  return router
}

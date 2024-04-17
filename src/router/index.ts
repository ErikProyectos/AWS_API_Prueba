import express from 'express'

import authentication from './authentication'
import users from './users'
import solutions from './solutions'
import screens from './screens'
import widgets from './widgets'

const router = express.Router()

/* This code snippet is exporting a default function that returns an instance of an Express Router.
Inside the function, it is registering various routes by calling functions like `authentication`,
`users`, `solutions`, `screens`, and `widgets` with the router instance as an argument. These
functions are likely responsible for setting up routes related to authentication, user management,
solutions, screens, and widgets in the application. Finally, the function returns the configured
router instance. */
export default (): express.Router => {
  authentication(router)
  users(router)
  solutions(router)
  screens(router)
  widgets(router)
  return router
}

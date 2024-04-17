/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'

import { login, register } from '../controllers/authentication'

// const router = express.Router()

/* This code is exporting a default function that takes an Express router as a parameter. Inside the
function, it defines two POST routes for registering and logging in users by calling the `register`
and `login` functions from the `../controllers/authentication` module. This function is intended to
be used to set up authentication routes in an Express application. */
export default (router: express.Router) => {
  router.post('/auth/register', register)
  router.post('/auth/login', login)
}

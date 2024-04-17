import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteScreen, getAllScreensBySolution, getOneScreenById, newScreen, updateScreen } from '../controllers/screens'

/* This code snippet is exporting a function as the default export. The function takes in an
`express.Router` object as a parameter. Inside the function, it sets up various routes using the
`router` object for handling different HTTP methods like POST, GET, DELETE, and PATCH related to
screens. */
export default (router: express.Router) => {
  router.post('/screens', isAuthenticated, newScreen)
  router.get('/screens', isAuthenticated, getAllScreensBySolution)
  router.get('/screens/:id', isAuthenticated, getOneScreenById)
  router.delete('/screens/:id', isAuthenticated, deleteScreen)
  router.patch('/screens/:id', isAuthenticated, updateScreen)
}

import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteScreen, getAllScreensBySolution, getOneScreenById, newScreen, updateScreen } from '../controllers/screens'

export default (router: express.Router) => {
  router.post('/screens', isAuthenticated, newScreen)
  router.get('/screens', isAuthenticated, getAllScreensBySolution)
  router.get('/screens/:id', isAuthenticated, getOneScreenById)
  router.delete('/screens/:id', isAuthenticated, deleteScreen)
  router.patch('/screens/:id', isAuthenticated, updateScreen)
}
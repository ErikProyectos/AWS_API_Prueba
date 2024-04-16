import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteSolution, getAllSolutionsByUser, getOneSolutionById, newSolution, updateSolution } from '../controllers/solutions'

export default (router: express.Router) => {
  router.post('/solutions', isAuthenticated, newSolution)
  router.get('/solutions', isAuthenticated, getAllSolutionsByUser)
  router.get('/solutions/:id', isAuthenticated, getOneSolutionById)
  router.delete('/solutions/:id', isAuthenticated, deleteSolution)
  router.patch('/solutions/:id', isAuthenticated, updateSolution)
}
import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteSolution, getAllSolutionsByUser, getOneSolutionById, newSolution, updateSolution } from '../controllers/solutions'

/* This code snippet is exporting a function that takes an instance of an Express Router as a
parameter. Inside the function, it sets up various routes for handling CRUD operations related to
solutions. Each route is associated with a specific HTTP method (POST, GET, DELETE, PATCH) and
corresponds to a specific controller function for handling the logic. */
export default (router: express.Router) => {
  router.post('/solutions', isAuthenticated, newSolution)
  router.get('/solutions', isAuthenticated, getAllSolutionsByUser)
  router.get('/solutions/:id', isAuthenticated, getOneSolutionById)
  router.delete('/solutions/:id', isAuthenticated, deleteSolution)
  router.patch('/solutions/:id', isAuthenticated, updateSolution)
}
import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteWidget, getAllWidgetsByScreen, getOneWidgetById, newWidget, updateWidget } from '../controllers/widgets'

/* This code snippet is exporting a function that takes an Express router as a parameter. Inside the
function, it sets up various routes for handling widget-related operations. Each route is associated
with a specific HTTP method (POST, GET, DELETE, PATCH) and corresponds to a different widget
controller function (newWidget, getAllWidgetsByScreen, getOneWidgetById, deleteWidget,
updateWidget). Additionally, the `isAuthenticated` middleware is applied to all these routes to
ensure that only authenticated users can access them. */
export default (router: express.Router) => {
router.post('/widgets', isAuthenticated, newWidget)
router.get('/widgets', isAuthenticated, getAllWidgetsByScreen)
  router.get('/widgets/:id', isAuthenticated, getOneWidgetById)
  router.delete('/widgets/:id', isAuthenticated, deleteWidget)
  router.patch('/widgets/:id', isAuthenticated, updateWidget)
}
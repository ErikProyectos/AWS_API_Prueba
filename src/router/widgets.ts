import express from 'express'

import { isAuthenticated } from '../middlewares'
import { deleteWidget, getAllWidgetsByScreen, getOneWidgetById, newWidget, updateWidget } from '../controllers/widgets'


export default (router: express.Router) => {
  router.post('/widgets', isAuthenticated, newWidget)
  router.get('/widgets', isAuthenticated, getAllWidgetsByScreen)
  router.get('/widgets/:id', isAuthenticated, getOneWidgetById)
  router.delete('/widgets/:id', isAuthenticated, deleteWidget)
  router.patch('/widgets/:id', isAuthenticated, updateWidget)
}
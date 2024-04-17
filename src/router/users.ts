import express from 'express'

import { deleteUser, getAllUsers, updateUser } from '../controllers/users'
import { isAuthenticated, isOwner } from '../middlewares'

/* This code snippet is exporting a default function that takes in an instance of an Express Router as
a parameter. Inside the function, it sets up three routes for handling user-related operations: */
export default (router: express.Router) => {
  router.get('/users', isAuthenticated, getAllUsers)
  router.delete('/users/:id', isAuthenticated, isOwner, deleteUser)
  router.patch('/users/:id', isAuthenticated, isOwner, updateUser)
}

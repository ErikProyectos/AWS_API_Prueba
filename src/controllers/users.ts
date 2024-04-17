/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'

import { getUsers, deleteUserById, getUserById } from '../db/users'

/**
 * This function retrieves all users asynchronously and returns them as a JSON response if successful,
 * otherwise it logs the error and sends a status code of 400.
 * @param _req - The `_req` parameter in the `getAllUsers` function is of type `express.Request`, which
 * represents the HTTP request object in Express.js. It contains information about the incoming request
 * such as headers, parameters, body, etc., and is used to interact with the client's request data.
 * @param res - The `res` parameter in the function `getAllUsers` is the response object from Express.
 * It is used to send a response back to the client making the request. In the provided code snippet,
 * `res` is used to send a JSON response with the status code 200 and the list of
 * @returns The getAllUsers function returns a response with status code 200 and a JSON object
 * containing the users data if the getUsers function call is successful. If an error occurs during the
 * getUsers function call, the function logs the error and returns a response with status code 400.
 */
export const getAllUsers = async (_req: express.Request, res: express.Response) => {
  try {
    const users = await getUsers()

    return res.status(200).json(users)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `deleteUser` asynchronously deletes a user by ID and returns the deleted user in a JSON
 * response or sends a status code 400 if an error occurs.
 * @param req - The `req` parameter in the `deleteUser` function is an object representing the HTTP
 * request. It contains information about the request made to the server, such as the request headers,
 * parameters, body, and more. In this specific function, `req` is of type `express.Request`, which
 * @param res - The `res` parameter in the `deleteUser` function is an instance of `express.Response`.
 * It is used to send a response back to the client making the request. In this function,
 * `res.json(deletedUser)` is used to send a JSON response containing the deleted user data, and
 * @returns The `deletedUser` object is being returned as a JSON response in the `deleteUser` function.
 */
export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedUser = await deleteUserById(id)

    return res.json(deletedUser)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function updateUser updates a user's username based on the request parameters and body, handling
 * errors appropriately.
 * @param req - The `req` parameter in the `updateUser` function is an Express Request object, which
 * represents the HTTP request that the server receives from the client. It contains information about
 * the request such as headers, parameters, body, and query parameters. This object is used to access
 * data sent by the client
 * @param res - The `res` parameter in the `updateUser` function is an instance of `express.Response`.
 * It is used to send the response back to the client making the request. In the function, it is used
 * to send status codes, JSON data, and end the response.
 * @returns The updateUser function returns a response with status code 200 and the updated user object
 * in JSON format if the username is provided in the request body and the update is successful. If
 * there is an error during the update process, it returns a response with status code 400.
 */
export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { username } = req.body

    if (!username) {
      return res.sendStatus(400)
    }

    const user = await getUserById(id)

    user.username = username
    await user.save()

    return res.status(200).json(user).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

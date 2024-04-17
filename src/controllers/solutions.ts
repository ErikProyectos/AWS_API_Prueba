/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createSolution, deleteSolutionById, getSolutionById, getSolutionsByUserId } from '../db/solutions'
import { get } from 'lodash'

/**
 * This TypeScript function handles a POST request to create a new solution with user ID, name, and
 * comment, returning the created solution or an error response.
 * @param req - express.Request object containing the request information
 * @param res - The `res` parameter in the `newSolution` function is an instance of `express.Response`.
 * It is used to send a response back to the client making the request. In the provided code snippet,
 * `res` is used to send different HTTP responses based on the outcome of the function execution.
 * @returns If the `UserId` or `name` is missing, a status of 400 will be sent back. If the solution is
 * successfully created, a status of 200 along with the created solution will be returned. If an error
 * occurs during the process, a status of 400 will be sent back.
 */
export const newSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { name, comment } = req.body
    const UserId = get(req, 'identity._id') as string

    if (!UserId || !name) {
      return res.sendStatus(400)
    }

    const solution = await createSolution({
      userId: UserId,
      name,
      comment
    })

    return res.status(200).json(solution).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * This function retrieves all solutions belonging to a specific user and sends them as a JSON
 * response.
 * @param req - The `req` parameter in the `getAllSolutionsByUser` function is an Express Request
 * object, which represents the HTTP request. It contains information about the request made by the
 * client, such as the request headers, parameters, body, and more. You can access specific data from
 * the request object
 * @param res - The `res` parameter in the `getAllSolutionsByUser` function is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * case, the function is sending a JSON response with the solutions retrieved for the current user or a
 * status
 * @returns The function `getAllSolutionsByUser` is returning a JSON response with the solutions
 * fetched by the current user ID if the operation is successful (status code 200). If an error occurs
 * during the process, it will log the error and return a status code of 400.
 */
export const getAllSolutionsByUser = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = get(req, 'identity._id') as string

    const solutions = await getSolutionsByUserId(currentUserId)

    return res.status(200).json(solutions)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * This function retrieves a solution by its ID and sends it as a JSON response, handling errors
 * appropriately.
 * @param req - The `req` parameter in the `getOneSolutionById` function is an object representing the
 * HTTP request. It contains information about the request made to the server, such as the request
 * headers, parameters, body, and other details. In this context, `req` is an instance of the `
 * @param res - The `res` parameter in the `getOneSolutionById` function is an instance of
 * `express.Response`. It is used to send the HTTP response back to the client with the data or error
 * message. In the provided code snippet, `res` is used to send a JSON response with the solution
 * @returns The function `getOneSolutionById` is returning a JSON response with the Solution object
 * fetched by the `getSolutionById` function if successful, and a status code of 200. If there is an
 * error, it logs the error and returns a status code of 400.
 */
export const getOneSolutionById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const Solution = await getSolutionById(id)

    return res.status(200).json(Solution)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `deleteSolution` deletes a solution by ID and returns the deleted solution in a JSON
 * response or sends a status code 400 if an error occurs.
 * @param req - express.Request
 * @param res - The `res` parameter in the `deleteSolution` function is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * function, `res.json()` is used to send a JSON response containing the deleted solution, and
 * `res.sendStatus(
 * @returns The `deleteSolution` function is returning a JSON response containing the `deletedSolution`
 * object if the deletion operation is successful. If an error occurs during the deletion process, it
 * will log the error and return a status code of 400 (Bad Request).
 */
export const deleteSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedSolution = await deleteSolutionById(id)

    return res.json(deletedSolution)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `updateSolution` updates a solution's name and comment based on the request parameters
 * and body, and then saves the changes.
 * @param req - The `req` parameter in the `updateSolution` function is an object representing the HTTP
 * request. It contains information about the request made to the server, such as the request headers,
 * body, parameters, and other details. In this case, it is of type `express.Request`, which is a
 * @param res - The `res` parameter in the `updateSolution` function is an instance of
 * `express.Response`. It is used to send the response back to the client making the request. In the
 * provided code snippet, `res` is used to send a JSON response with the updated solution data and a
 * status code
 * @returns a JSON response with the updated solution object and a status code of 200 if the update is
 * successful. If there is an error, it will log the error and return a status code of 400.
 */
export const updateSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { name, comment } = req.body

    const solution = await getSolutionById(id)

    solution.name = name
    solution.comment = comment

    await solution.save()

    return res.status(200).json(solution).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

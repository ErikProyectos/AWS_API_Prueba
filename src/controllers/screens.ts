/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createScreen, deleteScreenById, getScreenById, getScreensBySolutionId } from '../db/screens'

/**
 * The function `newScreen` creates a new screen with specified details and returns it as JSON
 * response.
 * @param req - express.Request object containing the request information
 * @param res - The `res` parameter in the `newScreen` function is an instance of `express.Response`.
 * It is used to send the HTTP response back to the client making the request. In the provided code
 * snippet, `res` is used to send different HTTP responses based on the outcome of the function
 * execution
 * @returns If the `solutionId` or `name` is missing from the request body, a status of 400 will be
 * sent back. If the screen creation is successful, the created screen object will be returned with a
 * status of 200. If an error occurs during the process, a status of 400 will be sent back.
 */
export const newScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { name, comment, solutionId } = req.body

    if (!solutionId || !name) {
      return res.sendStatus(400)
    }

    const screen = await createScreen({
      solutionId,
      name,
      comment
    })

    return res.status(200).json(screen).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * This function retrieves all screens associated with a specific solution ID and sends them as a JSON
 * response.
 * @param req - express.Request object containing the request information
 * @param res - The `res` parameter in the function `getAllScreensBySolution` is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * case, the response will contain the screens data retrieved by the function
 * `getScreensBySolutionId(solutionId
 * @returns The function `getAllScreensBySolution` is returning a JSON response with the screens
 * fetched by `getScreensBySolutionId` function if successful, and a status of 400 if there is an
 * error.
 */
export const getAllScreensBySolution = async (req: express.Request, res: express.Response) => {
  try {
    const { solutionId } = req.body

    const screens = await getScreensBySolutionId(solutionId)

    return res.status(200).json(screens)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `getOneScreenById` retrieves a screen by its ID and sends it as a JSON response,
 * handling errors appropriately.
 * @param req - The `req` parameter in the `getOneScreenById` function is an object representing the
 * HTTP request. It contains information about the request made by the client, such as the request
 * headers, parameters, body, and other details. In this case, it is of type `express.Request`, which
 * @param res - The `res` parameter in the `getOneScreenById` function is an instance of
 * `express.Response`. It is used to send the HTTP response back to the client. In this function, it is
 * used to send a JSON response with the screen data when the operation is successful (status 200
 * @returns The function `getOneScreenById` is returning a JSON response with the screen data if the
 * operation is successful (status code 200), or a status code 400 if there is an error.
 */
export const getOneScreenById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const screen = await getScreenById(id)

    return res.status(200).json(screen)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `deleteScreen` deletes a screen by its ID and returns the deleted screen in a JSON
 * response or sends a status code 400 if an error occurs.
 * @param req - The `req` parameter in the `deleteScreen` function is an object representing the HTTP
 * request. It contains information about the request made to the server, such as the request headers,
 * parameters, body, and other details. In this case, it is of type `express.Request`, which is a
 * @param res - The `res` parameter in the `deleteScreen` function is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * function, `res.json()` is used to send a JSON response containing the deleted screen data if the
 * deletion is successful
 * @returns The `deleteScreen` function is returning a JSON response containing the `deletedScreen`
 * object if the deletion operation is successful. If an error occurs during the deletion process, it
 * will log the error and return a status code of 400 (Bad Request).
 */
export const deleteScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedScreen = await deleteScreenById(id)

    return res.json(deletedScreen)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

/**
 * The function `updateScreen` updates the name and comment of a screen based on the provided ID.
 * @param req - The `req` parameter in the `updateScreen` function is an Express Request object, which
 * represents the HTTP request that the server receives from the client. It contains information about
 * the request such as the request headers, parameters, body, and other details sent by the client.
 * @param res - The `res` parameter in the `updateScreen` function is an instance of
 * `express.Response`. It is used to send the response back to the client making the request. In the
 * provided code snippet, `res` is used to send a JSON response with the updated screen data and a
 * status code
 * @returns a JSON response with the updated screen object and a status code of 200 if the update is
 * successful. If there is an error, it will log the error and return a status code of 400.
 */
export const updateScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { name, comment } = req.body

    const screen = await getScreenById(id)

    screen.name = name
    screen.comment = comment

    await screen.save()

    return res.status(200).json(screen).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

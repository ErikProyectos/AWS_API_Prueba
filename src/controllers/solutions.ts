/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createSolution, deleteSolutionById, getSolutionById, getSolutionsByUserId } from '../db/solutions'
import { get } from 'lodash'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()

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

export const newSolutionAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { name, userId, comment } = event.body

    // Verifica si UserId y name están presentes
    if (!userId || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    // Crea la solución en DynamoDB
    const solutionParams: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Item: {
        _id: Math.random().toString(36).substr(2, 9),
        userId,
        name,
        comment
      }
    }

    await dynamoDB.put(solutionParams).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Solution created successfully' })
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const getAllSolutionsByUserAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { userId } = event.body

    // Consultar todas las soluciones asociadas al usuario actual en DynamoDB
    const querySolutionsParams: DynamoDB.DocumentClient.QueryInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      IndexName: 'UserIdIndex', // Nombre del índice secundario global (GSI) por ID de usuario
      KeyConditionExpression: 'userId = :userId', // Condición de consulta por ID de usuario
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const solutions = await dynamoDB.query(querySolutionsParams).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(solutions.Items)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const getOneSolutionByIdAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    // Verifica si el ID es válido
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing ID parameter' })
      }
    }

    // Consulta la solución existente en DynamoDB
    const getSolutionParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const solution = await dynamoDB.get(getSolutionParams).promise()

    // Verifica si la solución existe
    if (!solution.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Solution not found' })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(solution.Item)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const deleteSolutionAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    // Verifica si el ID es válido
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing ID parameter' })
      }
    }

    // Consulta la solución existente en DynamoDB
    const getSolutionParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const existingSolution = await dynamoDB.get(getSolutionParams).promise()

    // Verifica si la solución existe
    if (!existingSolution.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Solution not found' })
      }
    }

    // Elimina la solución de DynamoDB
    const deleteSolutionParams: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      },
      ReturnValues: 'ALL_OLD' // Para devolver el elemento eliminado
    }

    const deletedSolution = await dynamoDB.delete(deleteSolutionParams).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(deletedSolution.Attributes)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const updateSolutionAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { name, comment } = event.body

    // Verifica si los campos obligatorios están presentes
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    // Consulta la solución existente en DynamoDB
    const getSolutionParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const existingSolution = await dynamoDB.get(getSolutionParams).promise()

    // Verifica si la solución existe
    if (!existingSolution.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Solution not found' })
      }
    }

    // Actualiza los campos de la solución
    const updateSolutionParams: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      },
      UpdateExpression: 'SET #name = :name, #comment = :comment',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#comment': 'comment'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':comment': comment
      },
      ReturnValues: 'ALL_NEW' // Para devolver el elemento actualizado
    }

    const updatedSolution = await dynamoDB.update(updateSolutionParams).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(updatedSolution.Attributes)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

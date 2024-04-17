/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createScreen, deleteScreenById, getScreenById, getScreensBySolutionId } from '../db/screens'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()

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

export const newScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { name, comment, solutionId } = event.body

    if (!solutionId || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    const paramsSearch: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'SolutionsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: solutionId
      }
    }

    const result = await dynamoDB.get(paramsSearch).promise()

    if (!result.Item) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Solution not found' })
      }
    }

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      Item: {
        _id: Math.random().toString(36).substr(2, 9), // Generar un ID único
        name,
        comment,
        solutionId
      }
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Screen created successfully' })
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const getAllScreensBySolutionAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { solutionId } = event.body

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      IndexName: 'SolutionIndex', // Nombre de tu índice global secundario en DynamoDB
      KeyConditionExpression: 'solutionId = :solutionId',
      ExpressionAttributeValues: {
        ':solutionId': solutionId
      }
    }

    const result = await dynamoDB.query(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const getOneScreenByIdAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Screen not found' })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Internal server error' })
    }
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

export const deleteScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    const getScreensParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const existingScreen = await dynamoDB.get(getScreensParams).promise()

    // Verifica si la solución existe
    if (!existingScreen.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Screen not found' })
      }
    }

    // Elimina la solución de DynamoDB
    const deleteScreenParams: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      },
      ReturnValues: 'ALL_OLD' // Para devolver el elemento eliminado
    }

    const deletedSolution = await dynamoDB.delete(deleteScreenParams).promise()

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

export const updateScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { name, comment } = event.body

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
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
      ReturnValues: 'ALL_NEW'
    }

    const updatedScreen = await dynamoDB.update(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(updatedScreen.Attributes)
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

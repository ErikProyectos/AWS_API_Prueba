/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createWidget, deleteWidgetById, getWidgetById, getwidgetssByScreenId } from '../db/widgets'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()
const typesOfWidgets = ['barGraph', 'pieGraph', 'table', 'card']

/**
 * The above TypeScript code defines functions for creating a new widget and getting all widgets by
 * screen ID.
 * @param req - The `req` parameter in the functions `newWidget` and `getAllWidgetsByScreen` represents
 * the request object in Express.js. It contains information about the HTTP request that triggered the
 * function, such as request headers, parameters, body, etc. You can access specific data from the
 * request object using
 * @param res - The `res` parameter in the functions `newWidget` and `getAllWidgetsByScreen` represents
 * the response object in Express.js. It is used to send a response back to the client making the
 * request. In the provided code snippets, `res` is used to send HTTP responses with status codes
 * @returns For the `newWidget` function:
 * - If any of the required fields (`screenId`, `name`, `type`) are missing in the request body, it
 * returns a status of 400.
 * - If the `type` of the widget is not included in the `typesOfWidgets` array, it creates a widget
 * with an empty `src` field.
 * - If the `type` of the widget is included in the `typesOfWidgets` array, it creates a widget with
 * an empty `values` array field.
 */
export const newWidget = async (req: express.Request, res: express.Response) => {
  try {
    const { name, screenId, type } = req.body
    let widget: any
    if (!screenId || !name || !type) {
      return res.sendStatus(400)
    }

    if (!typesOfWidgets.includes(type)) {
      const src = ''
      widget = await createWidget({
        screenId,
        name,
        type,
        src
      })
    } else {
      const values: any[] = []
      widget = await createWidget({
        screenId,
        name,
        type,
        values
      })
    }

    return res.status(200).json(widget).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const newWidgetAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { name, screenId, type, src, values } = event.body
    let widget: any

    if (!screenId || !name || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    const paramsSearch: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'ScreensTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: screenId
      }
    }

    const result = await dynamoDB.get(paramsSearch).promise()

    if (!result.Item) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Screen not found' })
      }
    }

    if (!typesOfWidgets.includes(type)) {
      widget = {
        _id: Math.random().toString(36).substr(2, 9),
        screenId,
        name,
        type,
        src
      }
    } else {
      widget = {
        _id: Math.random().toString(36).substr(2, 9),
        screenId,
        name,
        type,
        values
      }
    }
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'WidgetsTable', // Nombre de tu tabla en DynamoDB
      Item: widget
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(widget)
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
 * The function getAllWidgetsByScreen retrieves all widgets associated with a specific screen ID and
 * returns them as a JSON response.
 * @param req - The `req` parameter in the `getAllWidgetsByScreen` function is an Express Request
 * object, which represents the HTTP request that the server receives from the client. It contains
 * information about the request such as headers, body, parameters, query strings, etc.
 * @param res - The `res` parameter in the function `getAllWidgetsByScreen` is an instance of
 * `express.Response`. It is used to send the HTTP response back to the client. In this case, the
 * function is sending a JSON response with the widgets data when the operation is successful (status
 * 200),
 * @returns The function `getAllWidgetsByScreen` is returning a JSON response with the widgets fetched
 * by the `getwidgetssByScreenId` function if successful (status code 200), or a status code 400 if an
 * error occurs.
 */
export const getAllWidgetsByScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { screenId } = req.body

    const widgets = await getwidgetssByScreenId(screenId)

    return res.status(200).json(widgets)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getAllWidgetsByScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { screenId } = event.body

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: 'WidgetsTable', // Nombre de tu tabla en DynamoDB
      IndexName: 'ScreenIndex', // Nombre de tu índice global secundario en DynamoDB
      KeyConditionExpression: 'screenId = :screenId',
      ExpressionAttributeValues: {
        ':screenId': screenId
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
 * This function retrieves a widget by its ID from a database and sends it as a JSON response, handling
 * errors appropriately.
 * @param req - The `req` parameter in the `getOneWidgetById` function is an Express Request object,
 * which represents the HTTP request that the server receives from the client. It contains information
 * about the request such as the URL, headers, parameters, body, etc. In this case, the function is
 * expecting
 * @param res - The `res` parameter in the `getOneWidgetById` function is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * case, the function is sending a JSON response with the widget data when the request is successful
 * (status
 * @returns The function `getOneWidgetById` is returning a JSON response with the widget data if the
 * operation is successful (status code 200), or a status code 400 if there is an error.
 */
export const getOneWidgetById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const widget = await getWidgetById(id)

    return res.status(200).json(widget)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getOneWidgetByIdAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'WidgetsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Widget not found' })
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
 * The function `deleteWidget` asynchronously deletes a widget by its ID and returns the deleted widget
 * in a JSON response or sends a status code of 400 in case of an error.
 * @param req - The `req` parameter in the `deleteWidget` function is an object representing the HTTP
 * request. It contains information about the request made to the server, such as the request headers,
 * parameters, body, and other details. In this case, it is of type `express.Request`, which is a
 * @param res - The `res` parameter in the `deleteWidget` function is an instance of
 * `express.Response`. It is used to send a response back to the client making the request. In this
 * function, `res.json(deletedWidget)` is used to send the deleted widget as a JSON response, and `
 * @returns The `deleteWidget` function is returning the deleted widget in JSON format if the deletion
 * is successful. If an error occurs during the deletion process, it will log the error and return a
 * status of 400 (Bad Request) to the client.
 */
export const deleteWidget = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedWidget = await deleteWidgetById(id)

    return res.json(deletedWidget)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const deleteWidgetAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: 'WidgetsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      }
    }

    const result = await dynamoDB.delete(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
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
 * The function `updateWidget` updates a widget's type and name based on the request parameters and
 * body, and then saves the changes to the database.
 * @param req - The `req` parameter in the `updateWidget` function is an Express Request object, which
 * represents the HTTP request that the server receives from the client. It contains information about
 * the request such as headers, parameters, body, and query parameters. In this function, `req` is used
 * to extract
 * @param res - The `res` parameter in the `updateWidget` function is an instance of
 * `express.Response`. It is used to send the response back to the client making the request. In this
 * function, it is used to send a JSON response with the updated widget data and a status code of 200
 * if
 * @returns a response with status code 200 and a JSON object containing the updated widget data. If an
 * error occurs, it will log the error and return a response with status code 400.
 */
export const updateWidget = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { type, name } = req.body

    const widget = await getWidgetById(id)

    widget.name = name
    widget.type = type

    await widget.save()

    return res.status(200).json(widget).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const updateWidgetAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { type, name, src, values } = event.body

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'WidgetsTable', // Nombre de tu tabla en DynamoDB
      Key: {
        _id: id
      },
      UpdateExpression: 'set #name = :name, #type = :type, #src = :src, #values = :values',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#type': 'type',
        '#src': 'src',
        '#values': 'values'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':type': type,
        ':src': src,
        ':values': values
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await dynamoDB.update(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

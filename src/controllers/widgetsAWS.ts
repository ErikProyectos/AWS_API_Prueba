/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()
const typesOfWidgets = ['barGraph', 'pieGraph', 'table', 'card']

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
      TableName: 'ScreensTable',
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
      TableName: 'WidgetsTable',
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

export const getAllWidgetsByScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { screenId } = event.body

    const result = await dynamoDB.scan({
      TableName: 'WidgetsTable',
      FilterExpression: '#screenId = :screenId',
      ExpressionAttributeNames: {
        '#screenId': 'screenId' // Nombre del atributo
      },
      ExpressionAttributeValues: {
        ':screenId': screenId // Valor a comparar
      }
    }).promise()

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

export const getOneWidgetByIdAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'WidgetsTable',
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

export const deleteWidgetAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: 'WidgetsTable',
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

export const updateWidgetAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { type, name, src, values } = event.body

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'WidgetsTable',
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

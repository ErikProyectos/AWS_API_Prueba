/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()

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
      TableName: 'SolutionsTable',
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
      TableName: 'ScreensTable',
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

export const getAllScreensBySolutionAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { solutionId } = event.body

    const result = await dynamoDB.scan({
      TableName: 'ScreensTable',
      FilterExpression: '#solutionId = :solutionId',
      ExpressionAttributeNames: {
        '#solutionId': 'solutionId' // Nombre del atributo
      },
      ExpressionAttributeValues: {
        ':solutionId': solutionId // Valor a comparar
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

export const getOneScreenByIdAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'ScreensTable',
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
      TableName: 'ScreensTable',
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
      TableName: 'ScreensTable',
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

export const updateScreenAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { name, comment } = event.body

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'ScreensTable',
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

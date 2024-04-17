/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()

export const getAllUsersAWS = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Realizamos una consulta a la tabla de DynamoDB para obtener todos los usuarios
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: 'UsersTable'
    }

    const result = await dynamoDB.scan(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

export const deleteUserAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters

    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: 'UsersTable',
      Key: {
        _id: id // Suponiendo que 'id' es la clave primaria de tu tabla
      },
      ReturnValues: 'ALL_OLD' // Para devolver el elemento eliminado
    }

    const result = await dynamoDB.delete(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

export const updateUserAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters
    const { username } = event.body

    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing username in request body' })
      }
    }

    // Primero obtenemos el usuario de la base de datos
    const getUserParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: 'UsersTable',
      Key: {
        _id: id // Suponiendo que 'id' es la clave primaria de tu tabla
      }
    }

    const existingUser = await dynamoDB.get(getUserParams).promise()

    if (!existingUser.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      }
    }

    // Actualizamos el nombre de usuario del usuario obtenido
    const updateUserParams: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: 'UsersTable', 
      Key: {
        _id: id
      },
      UpdateExpression: 'SET #username = :username',
      ExpressionAttributeNames: {
        '#username': 'username'
      },
      ExpressionAttributeValues: {
        ':username': username
      },
      ReturnValues: 'ALL_NEW' // Para devolver el elemento actualizado
    }

    const updatedUser = await dynamoDB.update(updateUserParams).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(updatedUser.Attributes)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

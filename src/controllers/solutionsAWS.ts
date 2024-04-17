import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDB = new DynamoDB.DocumentClient()

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
      TableName: 'SolutionsTable',
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

export const getAllSolutionsByUserAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { userId } = event.body

    // Consultar todas las soluciones asociadas al usuario actual en DynamoDB
    const solutions = await dynamoDB.scan({
      TableName: 'SolutionsTable',
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId' // Nombre del atributo
      },
      ExpressionAttributeValues: {
        ':userId': userId // Valor a comparar
      }
    }).promise()

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
      TableName: 'SolutionsTable',
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
      TableName: 'SolutionsTable',
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
      TableName: 'SolutionsTable',
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
      TableName: 'SolutionsTable',
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
      TableName: 'SolutionsTable',
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

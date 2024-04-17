/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AWS from 'aws-sdk'
import * as yup from 'yup'

const dynamoDB = new AWS.DynamoDB.DocumentClient()
const cognito = new AWS.CognitoIdentityServiceProvider()

const schema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
  email: yup.string().required()
})

export const loginAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { username, password } = event.body

  try {
    const authResult = await cognito.adminInitiateAuth({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: 'TU_CLIENT_ID',
      UserPoolId: 'TU_USER_POOL_ID',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    }).promise()

    // Si el login es exitoso, devolvemos un token de autenticación
    return {
      statusCode: 200,
      body: JSON.stringify({
        token: authResult.AuthenticationResult.AccessToken
      })
    }
  } catch (error) {
    // Manejo de errores, por ejemplo, credenciales incorrectas
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Credenciales incorrectas' })
    }
  }
}

export const registerAWS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = event.body
    await schema.validate(reqBody, { abortEarly: false })

    const user = {
      ...reqBody,
      _id: Math.random().toString(36).substr(2, 9)
    }
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'UsersTable',
      Item: user
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully' })
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

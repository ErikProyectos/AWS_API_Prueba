/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import express from 'express'

import { createUser, getUserByEmail } from '../db/users'
import { authentication, random } from '../helpers'
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

/**
 * The login function in TypeScript handles user authentication by checking email and password,
 * generating session tokens, and setting cookies.
 * @param req - The `req` parameter in the `login` function is an object representing the HTTP
 * request. It contains information about the request made to the server, such as the request
 * headers, body, parameters, and more. In this case, it is specifically of type
 * `express.Request`, which is a type
 * @param res - The `res` parameter in the `login` function is an instance of
 * `express.Response`, which is used to send a response back to the client making the request.
 * It allows you to send HTTP responses with data such as status codes, headers, and the
 * response body. In the provided code snippet
 * @returns The login function returns different HTTP status codes based on the outcome of the
 * login process:
 * - If the email or password is missing in the request body, it returns a status of 400 (Bad
 * Request).
 * - If the user with the provided email is not found, it returns a status of 400.
 * - If the password provided does not match the stored password hash, it returns a status of
 */
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.sendStatus(400)
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password')

    if (!user) {
      return res.sendStatus(400)
    }

    const expectedHash = authentication(user.authentication.salt, password)

    if (user.authentication.password !== expectedHash) {
      return res.sendStatus(403)
    }

    const salt = random()
    user.authentication.sessionToken = authentication(salt, user._id.toString())

    await user.save()

    res.cookie('USER-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' })

    return res.status(200).json(user).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
/**
 * The function `register` handles user registration by checking for required fields, verifying email
 * uniqueness, creating a new user with hashed password, and returning the user data.
 * @param req - The `req` parameter in the `register` function is an object representing the HTTP
 * request. It contains information about the request made by the client, such as request headers,
 * parameters, body, and more. In this specific function, `req` is of type `express.Request`, which is
 * a
 * @param res - The `res` parameter in the `register` function is an instance of `express.Response`. It
 * is used to send a response back to the client making the request. In the provided code snippet,
 * `res` is used to send different status codes and response data based on the outcome of the
 * registration
 * @returns If the registration is successful, a status of 200 along with the user object is being
 * returned. If there are missing fields in the request body or if a user with the same email already
 * exists, a status of 400 is being returned. If an error occurs during the registration process, a
 * status of 400 is also being returned.
 */
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.sendStatus(400)
    }

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return res.sendStatus(400)
    }

    const salt = random()
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password)
      }
    })

    return res.status(200).json(user).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
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

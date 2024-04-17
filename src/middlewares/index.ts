/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { get, merge } from 'lodash'

import { getUserBySessionToken } from '../db/users'
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'

export const isAuthenticatedAWS = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const sessionToken = event.authorizationToken

    if (!sessionToken) {
      return generatePolicy('user', 'Deny', event.methodArn)
    }

    const existingUser = await getUserBySessionToken(sessionToken)

    if (!existingUser) {
      return generatePolicy('user', 'Deny', event.methodArn)
    }

    return generatePolicy('user', 'Allow', event.methodArn)
  } catch (error) {
    console.log(error)
    return generatePolicy('user', 'Deny', event.methodArn)
  }
}

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  }
}

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params
    const currentUserId = get(req, 'identity._id') as string

    if (!currentUserId) {
      return res.sendStatus(403)
    }

    if (currentUserId.toString() !== id) {
      return res.sendStatus(403)
    }

    return next()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['USER-AUTH']

    if (!sessionToken) {
      return res.sendStatus(403)
    }

    const existingUser = await getUserBySessionToken(sessionToken)

    if (!existingUser) {
      return res.sendStatus(403)
    }

    merge(req, { identity: existingUser })

    return next()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

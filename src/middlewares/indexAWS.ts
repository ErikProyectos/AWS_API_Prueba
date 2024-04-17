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
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../../lambda/utils'
// import { createLogger } from '../../utils/logger'
import { createTodo } from '../../businessLogic/todos'

// const AWS = require('aws-sdk')
// const AWSXRay = require('aws-xray-sdk')
// const AWSX = AWSXRay.captureAWS(AWS)

// const logger = createLogger('Lambda-createTodos')
// const docClient = createDocumentClient()
// const TABLENAME : string = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId : string = getUserId(event)

  // TODO: Implement creating a new TODO item
  
  const item = await createTodo(newTodo, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
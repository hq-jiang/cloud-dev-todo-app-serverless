import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 } from 'uuid';
import { getUserId } from '../../lambda/utils'
import { createLogger } from '../../utils/logger'

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
const AWSX = AWSXRay.captureAWS(AWS)

const logger = createLogger('Lambda-createTodos')
const docClient = createDocumentClient()
const TABLENAME : string = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const item = {
    ...newTodo,
    userId: getUserId(event),
    todoId: v4(),
    createdAt: new Date().toISOString(),
    done: false,
  }
  logger.info('New item created', item)

  const params = {
    TableName : TABLENAME,
    Item: item
  }
  
  logger.info('Uploading new item to database')
  await docClient.put(params).promise()

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

function createDocumentClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Create a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new AWSX.DynamoDB.DocumentClient()
  }
}
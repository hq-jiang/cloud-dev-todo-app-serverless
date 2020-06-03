import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Lambda-deleteTodos')
const AWS = require('aws-sdk')

const AWSXRay = require('aws-xray-sdk')
const AWSX = AWSXRay.captureAWS(AWS)

const documentClient = createDocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // First find the createdAt field for the todo, since it is part of the composite key
  const paramsGet = {
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: 'todoId = :todoIddelete',
    ExpressionAttributeValues: {
      ':todoIddelete': todoId,
    }
  }
  const todo = await documentClient.query(paramsGet).promise()
  logger.info('get todo', todo)

  const paramsDelete = {
    TableName : todosTable,
    Key: {
      todoId: todoId,
      createdAt: todo.Items[0].createdAt
    }
  };
  
  await documentClient.delete(paramsDelete).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(todo)
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
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 } from 'uuid';

const AWS = require('aws-sdk');

const docClient = createDocumentClient()
const TABLENAME : string = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  console.log(newTodo);
  const item = {
    ...newTodo,
    userId: '1',
    todoId: v4(),
    createdAt: new Date().toISOString(),
    done: false,
  }

  const params = {
    TableName : TABLENAME,
    Item: item
  }
  
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
    console.log('Create a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new AWS.DynamoDB.DocumentClient()
  }
}
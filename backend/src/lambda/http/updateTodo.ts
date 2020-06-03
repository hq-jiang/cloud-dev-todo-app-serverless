import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { createLogger } from '../../utils/logger'

const AWS = require('aws-sdk')

const AWSXRay = require('aws-xray-sdk')
const AWSX = AWSXRay.captureAWS(AWS)

const logger = createLogger('Lambda-updateTodos')

const documentClient = createDocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log('update body', updatedTodo)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  const paramsGet = {
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: 'todoId = :todoIddelete',
    ExpressionAttributeValues: {
      ':todoIddelete': todoId,
    }
  }
  const todo = await documentClient.query(paramsGet).promise()

  var params = {
    TableName: todosTable,
    Key: { 
      todoId : todoId, 
      createdAt: todo.Items[0].createdAt 
    },
    UpdateExpression: 'set #name = :updatedName, #dueDate = :updatedDueDate, #done = :updatedDone',
    ExpressionAttributeNames: {'#name' : 'name', '#dueDate': 'dueDate', '#done': 'done'},
    ExpressionAttributeValues: {
      ':updatedName' : updatedTodo.name,
      ':updatedDueDate' : updatedTodo.dueDate,
      ':updatedDone' : updatedTodo.done,
    }
  };

  await documentClient.update(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(updatedTodo)
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
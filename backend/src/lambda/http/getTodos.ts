import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
const AWS = require('aws-sdk')

const docClient = createDocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const userId = event.requestContext.authorizer.principalId
  const params = {
    TableName: process.env.TODOS_TABLE,
    IndexName: process.env.INDEX_NAME,
    KeyConditionExpression: 'userId = :loggedInUser',
    ExpressionAttributeValues: {
      ':loggedInUser': userId
    }
  }
  const todos = await docClient.query(params).promise()
  console.log(todos)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: todos.Items
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
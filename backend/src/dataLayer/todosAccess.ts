import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from  '../models/TodoItem'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

const TABLENAME : string = process.env.TODOS_TABLE;
const logger = createLogger('dataLayer-todoAcess')

export class TodosAccess {
  constructor(
    private readonly documentClient: DocumentClient = createDocumentClient(),
  ) {}
    
  async createTodo(item : TodoItem): Promise<TodoItem> {
    const params = {
      TableName : TABLENAME,
      Item: item
    }
      
    logger.info('Uploading new item to database')
    await this.documentClient.put(params).promise()
    return item
  }

  async deleteTodo(todoId : string): Promise<any> {
    // First find the createdAt field for the todo, since it is part of the composite key
    const paramsGet = {
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'todoId = :todoIddelete',
      ExpressionAttributeValues: {
        ':todoIddelete': todoId,
      }
    }
    const todo = await this.documentClient.query(paramsGet).promise()
    logger.info('get todo', todo)

    const paramsDelete = {
      TableName : TABLENAME,
      Key: {
        todoId: todoId,
        createdAt: todo.Items[0].createdAt
      }
    };
    
    await this.documentClient.delete(paramsDelete).promise()
    logger.info('deleted todo', todo)
    return todo
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

function useAWSX() {
  // Disable AWS-XRAY in local mode to prevent runtime error
  if (process.env.IS_OFFLINE) {
    return undefined
  } else {
    const AWSXRay = require('aws-xray-sdk')
    const AWSX = AWSXRay.captureAWS(AWS)
    return AWSX
  }
}
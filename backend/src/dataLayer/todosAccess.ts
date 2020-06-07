import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from  '../models/TodoItem'
import { TodoUpdate } from  '../models/TodoUpdate'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

const TABLENAME : string = process.env.TODOS_TABLE;
const logger = createLogger('dataLayer-todoAccess')

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

  async getTodos(userId : string) : Promise<any>{
    const params = {
      TableName: process.env.TODOS_TABLE,
      IndexName: process.env.INDEX_NAME,
      KeyConditionExpression: 'userId = :loggedInUser',
      ExpressionAttributeValues: {
        ':loggedInUser': userId,
      }
    }
    const todos = await this.documentClient.query(params).promise()
    logger.info('Get all todos', todos)
    return todos
  }

  async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate>{
    const paramsGet = {
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'todoId = :todoIddelete',
      ExpressionAttributeValues: {
        ':todoIddelete': todoId,
      }
    }
    const todo = await this.documentClient.query(paramsGet).promise()
  
    var params = {
      TableName: process.env.TODOS_TABLE,
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
  
    await this.documentClient.update(params).promise();
    
    return updatedTodo
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
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger';
import { TodoItem } from  '../models/TodoItem'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

const TABLENAME : string = process.env.TODOS_TABLE;
const logger = createLogger('dataLayer-todoAcess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDocumentClient(),
  ) {}
    
  async createTodo(item : TodoItem): Promise<TodoItem> {
    const params = {
      TableName : TABLENAME,
      Item: item
    }
      
    logger.info('Uploading new item to database')
    await this.docClient.put(params).promise()
    return item
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
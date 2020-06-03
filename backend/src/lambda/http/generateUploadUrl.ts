import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'


const AWS = require('aws-sdk')

const AWSXRay = require('aws-xray-sdk')
const AWSX = AWSXRay.captureAWS(AWS)

const logger = createLogger('Lambda-generateUploadUrl')

const s3 = createS3()

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: s3BucketName,
    Key: todoId,
    Expires: '300'
  })
  logger.info('Signed url', {uploadUrl})
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}


function createS3() {
  if (process.env.IS_OFFLINE) {
    logger.info('Create a local S3 instance')
    return new AWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
      endpoint: new AWS.Endpoint('http://localhost:8001'),
    })
  } else {
    return new AWSX.S3({
      signatureVersion: 'v4'
    })
  }
}
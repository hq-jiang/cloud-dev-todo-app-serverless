import { createLogger } from '../utils/logger'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

const logger = createLogger('dataLayer-attachmentsAccess')

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET

export class AttachmentsAccess {
  constructor(
    private readonly s3 = createS3()
  ) {}

  async getUploadUrl(todoId: string) {
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: s3BucketName,
      Key: todoId,
      Expires: '300'
    })
    logger.info('Signed url', {uploadUrl})
    return uploadUrl
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
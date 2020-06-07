import { AttachmentsAccess } from '../dataLayer/attachmentsAccess'
import { createLogger } from '../utils/logger';

const logger = createLogger('businessLogic-attachments')

const attachmentsAccess = new AttachmentsAccess()

export async function getUploadUrl(todoId: string) {
  logger.info('Get UploadUrl')
  const uploadUrl = await attachmentsAccess.getUploadUrl(todoId)
  logger.info('Gotten UploadUrl', uploadUrl)
  return uploadUrl
}
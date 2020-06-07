import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { v4 } from 'uuid';
import { createLogger } from '../utils/logger';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('BusinessLogic-todo')

const todosAccess = new TodosAccess()

export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const item: TodoItem = {
        ...newTodo,
        userId: userId,
        todoId: v4(),
        createdAt: new Date().toISOString(),
        done: false,
      }
      logger.info('New item instantiated', item)
    
      await todosAccess.createTodo(item)

    return item
}

export async function deleteTodo(todoId: string): Promise<any>{
  
  const todo = await todosAccess.deleteTodo(todoId)
  return todo
}

export async function getTodos(userId: string): Promise<any>{
  logger.info('Query db for todos')

  const todos = await todosAccess.getTodos(userId)
  return todos
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest) {
  logger.info('update body', updatedTodo)
  const updateditem = await todosAccess.updateTodo(todoId, updatedTodo)
  return updateditem
}

export async function updateAttachmentUrl(todoId: string): Promise<string> {
  logger.info('update attachmentUrl')
  const attachmentUrl = await todosAccess.updateAttachmentUrl(todoId)
  logger.info('attachmentUrl', attachmentUrl)
  return attachmentUrl
}
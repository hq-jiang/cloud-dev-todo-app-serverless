import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { v4 } from 'uuid';
import { createLogger } from '../utils/logger';

const logger = createLogger('BusinessLogic-todo')

const todosAccess = new TodosAccess()

export async function createTodo(newTodo : CreateTodoRequest, userId : string) : Promise<TodoItem> {

    const item : TodoItem = {
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

export async function deleteTodo(todoId : string) : Promise<any>{
  
  const todo = await todosAccess.deleteTodo(todoId)
  return todo
}
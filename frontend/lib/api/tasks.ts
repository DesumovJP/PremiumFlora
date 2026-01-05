/**
 * Tasks API
 *
 * CRUD операції для завдань (GraphQL)
 */

import { graphqlRequest } from './client';
import {
  GET_TASKS,
  GET_TASK_BY_ID,
  GET_UPCOMING_TASKS,
} from '../graphql/queries';
import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
} from '../graphql/mutations';
import type {
  GraphQLTask,
  TasksResponse,
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
} from '../graphql/types';
import type { ApiResponse } from '../api-types';

// Re-export types
export type { GraphQLTask, CreateTaskInput, UpdateTaskInput };

/**
 * Отримати всі завдання
 */
export async function getTasks(status?: string): Promise<ApiResponse<GraphQLTask[]>> {
  try {
    const data = await graphqlRequest<TasksResponse>(GET_TASKS, {
      pageSize: 100,
      status: status || undefined,
    });

    return {
      success: true,
      data: data.tasks,
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch tasks',
      },
    };
  }
}

/**
 * Отримати активні завдання (pending/in_progress)
 * Включає прострочені завдання
 */
export async function getUpcomingTasks(): Promise<ApiResponse<GraphQLTask[]>> {
  try {
    const data = await graphqlRequest<TasksResponse>(GET_UPCOMING_TASKS, {
      pageSize: 50,
    });

    return {
      success: true,
      data: data.tasks,
    };
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch tasks',
      },
    };
  }
}

/**
 * Отримати завдання за ID
 */
export async function getTaskById(documentId: string): Promise<ApiResponse<GraphQLTask>> {
  try {
    const data = await graphqlRequest<TaskResponse>(GET_TASK_BY_ID, {
      documentId,
    });

    if (!data.task) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found',
        },
      };
    }

    return {
      success: true,
      data: data.task,
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch task',
      },
    };
  }
}

/**
 * Створити завдання
 */
export async function createTask(data: CreateTaskInput): Promise<ApiResponse<GraphQLTask>> {
  try {
    const result = await graphqlRequest<{ createTask: GraphQLTask }>(
      CREATE_TASK,
      { data },
      true
    );

    return {
      success: true,
      data: result.createTask,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create task',
      },
    };
  }
}

/**
 * Оновити завдання
 */
export async function updateTask(
  documentId: string,
  data: UpdateTaskInput
): Promise<ApiResponse<GraphQLTask>> {
  try {
    const result = await graphqlRequest<{ updateTask: GraphQLTask }>(
      UPDATE_TASK,
      { documentId, data },
      true
    );

    return {
      success: true,
      data: result.updateTask,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update task',
      },
    };
  }
}

/**
 * Видалити завдання
 */
export async function deleteTask(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_TASK, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete task',
      },
    };
  }
}

/**
 * Позначити завдання як виконане
 */
export async function completeTask(documentId: string): Promise<ApiResponse<GraphQLTask>> {
  return updateTask(documentId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

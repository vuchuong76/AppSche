import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Schedule, Task } from '../types';
import { getCategoryColor, createDateTimeKey } from './utils';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const SCHEDULES_TABLE = process.env.NEXT_PUBLIC_AWS_SCHEDULES_TABLE!;
const TASKS_TABLE = process.env.NEXT_PUBLIC_AWS_TASKS_TABLE!;

// ============================================
// SCHEDULE OPERATIONS
// ============================================

/**
 * Get schedules for a user, optionally filtered by date
 */
export async function getSchedules(userId: string, date?: string): Promise<Schedule[]> {
  let keyCondition = 'userId = :userId';
  const expressionValues: any = { ':userId': userId };

  if (date) {
    keyCondition += ' AND begins_with(dateTime, :date)';
    expressionValues[':date'] = date;
  }

  const command = new QueryCommand({
    TableName: SCHEDULES_TABLE,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
  });

  const response = await docClient.send(command);
  return (response.Items as Schedule[]) || [];
}

/**
 * Add a new schedule
 */
export async function addSchedule(
  userId: string,
  schedule: Omit<Schedule, 'userId' | 'dateTime' | 'createdAt' | 'color'>
): Promise<Schedule> {
  const dateTime = createDateTimeKey(schedule.date, schedule.startTime);
  const color = getCategoryColor(schedule.category);

  const newSchedule: Schedule = {
    userId,
    dateTime,
    ...schedule,
    color,
    createdAt: Date.now(),
  };

  const command = new PutCommand({
    TableName: SCHEDULES_TABLE,
    Item: newSchedule,
  });

  await docClient.send(command);
  return newSchedule;
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  userId: string,
  dateTime: string,
  updates: Partial<Omit<Schedule, 'userId' | 'dateTime' | 'createdAt'>>
): Promise<Schedule> {
  const updateExpressions: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, any> = {};

  let index = 0;
  Object.entries(updates).forEach(([key, value]) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionNames[attrName] = key;
    expressionValues[attrValue] = value;
    index++;
  });

  // Add updatedAt
  updateExpressions.push(`#updatedAt = :updatedAt`);
  expressionNames['#updatedAt'] = 'updatedAt';
  expressionValues[':updatedAt'] = Date.now();

  const command = new UpdateCommand({
    TableName: SCHEDULES_TABLE,
    Key: { userId, dateTime },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes as Schedule;
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(userId: string, dateTime: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: SCHEDULES_TABLE,
    Key: { userId, dateTime },
  });

  await docClient.send(command);
}

// ============================================
// TASK OPERATIONS
// ============================================

/**
 * Get all tasks for a user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  const command = new QueryCommand({
    TableName: TASKS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
  });

  const response = await docClient.send(command);
  return (response.Items as Task[]) || [];
}

/**
 * Add a new task
 */
export async function addTask(
  userId: string,
  task: Omit<Task, 'userId' | 'taskId' | 'createdAt' | 'status'>
): Promise<Task> {
  const taskId = uuidv4();

  const newTask: Task = {
    userId,
    taskId,
    ...task,
    status: 'TODO',
    createdAt: Date.now(),
  };

  const command = new PutCommand({
    TableName: TASKS_TABLE,
    Item: newTask,
  });

  await docClient.send(command);
  return newTask;
}

/**
 * Update an existing task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Omit<Task, 'userId' | 'taskId' | 'createdAt'>>
): Promise<Task> {
  const updateExpressions: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, any> = {};

  let index = 0;
  Object.entries(updates).forEach(([key, value]) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionNames[attrName] = key;
    expressionValues[attrValue] = value;
    index++;
  });

  // Add updatedAt
  updateExpressions.push(`#updatedAt = :updatedAt`);
  expressionNames['#updatedAt'] = 'updatedAt';
  expressionValues[':updatedAt'] = Date.now();

  const command = new UpdateCommand({
    TableName: TASKS_TABLE,
    Key: { userId, taskId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes as Task;
}

/**
 * Delete a task
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: TASKS_TABLE,
    Key: { userId, taskId },
  });

  await docClient.send(command);
}

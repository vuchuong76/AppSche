import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken, verifyToken } from '@/lib/auth';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/dynamodb';

/**
 * Verify authorization header and extract userId
 */
function authorizeRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!verifyToken(token)) {
    return null;
  }

  return getUserIdFromToken(token);
}

/**
 * GET /api/tasks
 * Fetch all tasks for user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = authorizeRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tasks = await getTasks(userId);

    // Sort by createdAt descending (newest first)
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const userId = authorizeRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, priority, category, deadline } = body;

    // Validation
    if (!title || !priority || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTask = await addTask(userId, {
      title,
      priority,
      category,
      deadline,
    });

    return NextResponse.json({
      success: true,
      data: newTask,
    });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks
 * Update an existing task
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = authorizeRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId or updates' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTask(userId, taskId, updates);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    console.error('PUT /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks?taskId=uuid
 * Delete a task
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = authorizeRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId parameter' },
        { status: 400 }
      );
    }

    await deleteTask(userId, taskId);

    return NextResponse.json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error: any) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}

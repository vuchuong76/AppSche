import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken, verifyToken } from '@/lib/auth';
import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '@/lib/dynamodb';

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
 * GET /api/schedules?date=YYYY-MM-DD
 * Fetch schedules for user, optionally filtered by date
 */
export async function GET(request: NextRequest) {
  try {
    const userId = authorizeRequest(request);
    if (!userId) {
      console.log('❌ [API] Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    console.log('📥 [API GET] Fetching schedules:', { userId, date });

    const schedules = await getSchedules(userId, date);

    console.log(`✅ [API GET] Found ${schedules.length} schedules`);

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error: any) {
    console.error('GET /api/schedules error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 * Create a new schedule
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
    const { title, date, startTime, endTime, category } = body;

    // Validation
    if (!title || !date || !startTime || !endTime || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSchedule = await addSchedule(userId, {
      title,
      date,
      startTime,
      endTime,
      category,
    });

    return NextResponse.json({
      success: true,
      data: newSchedule,
    });
  } catch (error: any) {
    console.error('POST /api/schedules error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedules
 * Update an existing schedule
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
    const { dateTime, updates } = body;

    if (!dateTime || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing dateTime or updates' },
        { status: 400 }
      );
    }

    const updatedSchedule = await updateSchedule(userId, dateTime, updates);

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
    });
  } catch (error: any) {
    console.error('PUT /api/schedules error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules?dateTime=YYYY-MM-DD#HH:mm
 * Delete a schedule
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
    const dateTime = searchParams.get('dateTime');

    if (!dateTime) {
      return NextResponse.json(
        { success: false, error: 'Missing dateTime parameter' },
        { status: 400 }
      );
    }

    await deleteSchedule(userId, dateTime);

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted',
    });
  } catch (error: any) {
    console.error('DELETE /api/schedules error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

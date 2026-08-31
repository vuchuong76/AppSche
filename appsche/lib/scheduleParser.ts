/**
 * AI Schedule Parser - Parse text input into structured schedules
 */

export interface ParsedSchedule {
  title: string;
  startTime: string;
  endTime: string;
  category: string;
}

// Category detection keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  work: ['code', 'công việc', 'work', 'meeting', 'họp', 'thiết kế', 'kiến trúc', 'deep work', 'văn phòng'],
  family: ['gia đình', 'vợ', 'con', 'bố', 'mẹ', 'family', 'daycare', 'chuẩn bị con', 'đưa con'],
  learning: ['học', 'aws', 'study', 'video', 'course', 'udemy', 'podcast', 'ghi chú', 'learning'],
  cook: ['nấu', 'ăn', 'cook', 'cơm', 'bữa', 'trưa', 'tối', 'sáng', 'dọn dẹp', 'rửa bát'],
  exercise: ['gym', 'tập', 'exercise', 'chạy', 'yoga', 'thể dục'],
  rest: ['ngủ', 'thư giãn', 'nghỉ', 'rest', 'relax', 'về nhà', 'lái xe', 'đi lại'],
};

/**
 * Detect category from text using keywords
 */
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'work'; // Default category
}

/**
 * Parse time range from text (e.g., "6:00-7:00", "09:40-12:00")
 */
function parseTimeRange(text: string): { start: string; end: string } | null {
  // Match patterns like: 6:00-7:00, 09:40-12:00, 6:00 - 7:00
  const timePattern = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/;
  const match = text.match(timePattern);

  if (match) {
    const [, startHour, startMin, endHour, endMin] = match;
    return {
      start: `${startHour.padStart(2, '0')}:${startMin}`,
      end: `${endHour.padStart(2, '0')}:${endMin}`,
    };
  }

  return null;
}

/**
 * Extract title from line (remove time and separators)
 */
function extractTitle(line: string, timeRange: { start: string; end: string }): string {
  // Remove time range
  let title = line.replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/, '').trim();

  // Remove leading separators (|, -, →, etc.)
  title = title.replace(/^[\s|→\-]+/, '').trim();

  // Remove category hints in parentheses at the end
  title = title.replace(/\s*\([^)]*\)\s*$/, '').trim();

  return title;
}

/**
 * Parse bulk schedule text into array of schedules
 */
export function parseScheduleText(text: string): ParsedSchedule[] {
  const lines = text.split('\n').filter(line => line.trim());
  const schedules: ParsedSchedule[] = [];

  for (const line of lines) {
    const timeRange = parseTimeRange(line);

    if (timeRange) {
      const title = extractTitle(line, timeRange);

      // Skip if title is empty or too short
      if (!title || title.length < 3) continue;

      const category = detectCategory(line);

      schedules.push({
        title,
        startTime: timeRange.start,
        endTime: timeRange.end,
        category,
      });
    }
  }

  return schedules;
}

/**
 * Validate parsed schedule
 */
export function validateSchedule(schedule: ParsedSchedule): { valid: boolean; error?: string } {
  if (!schedule.title || schedule.title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }

  if (schedule.startTime >= schedule.endTime) {
    return { valid: false, error: 'Start time must be before end time' };
  }

  return { valid: true };
}

/**
 * Format schedule for display
 */
export function formatSchedulePreview(schedule: ParsedSchedule): string {
  return `${schedule.startTime}-${schedule.endTime} | ${schedule.title} [${schedule.category}]`;
}

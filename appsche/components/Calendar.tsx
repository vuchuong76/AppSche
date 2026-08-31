'use client';

import { useState } from 'react';
import { Schedule } from '@/types';
import { getDatesInMonth, getMonthName, getDayOfWeek } from '@/lib/utils';

interface CalendarProps {
  schedules: Schedule[];
  onDateClick: (date: string) => void;
}

export default function Calendar({ schedules, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dates = getDatesInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Group schedules by date
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.date]) {
      acc[schedule.date] = [];
    }
    acc[schedule.date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {getMonthName(month)} {year}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar dates */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Date cells */}
          {dates.map((date) => {
            const daySchedules = schedulesByDate[date] || [];
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <button
                key={date}
                onClick={() => onDateClick(date)}
                className={`aspect-square p-2 rounded-lg border transition-colors ${
                  isToday
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {new Date(date).getDate()}
                  </span>
                </div>
                {daySchedules.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {daySchedules.slice(0, 2).map((schedule, idx) => (
                      <div
                        key={idx}
                        className="text-xs truncate px-1 py-0.5 rounded text-white"
                        style={{ backgroundColor: schedule.color }}
                      >
                        {schedule.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{daySchedules.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

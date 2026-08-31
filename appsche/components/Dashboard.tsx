'use client';

import { Schedule, Task } from '@/types';
import { formatTime, getTodayString } from '@/lib/utils';

interface DashboardProps {
  schedules: Schedule[];
  tasks: Task[];
  selectedDate: string;
  onAddSchedule: () => void;
  onAddTask: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onConvertToTask: (schedule: Schedule) => void;
}

export default function Dashboard({
  schedules,
  tasks,
  selectedDate,
  onAddSchedule,
  onAddTask,
  onPrevDay,
  onNextDay,
  onToday,
  onConvertToTask,
}: DashboardProps) {
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length;
  const isToday = selectedDate === getTodayString();
  // Parse as local date to avoid UTC off-by-one on YYYY-MM-DD strings
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const selectedDateLabel = new Date(selYear, selMonth - 1, selDay).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-2 mt-1">
            <button
              onClick={onPrevDay}
              aria-label="Previous day"
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
            >
              ‹
            </button>
            <p className="text-gray-600 min-w-[220px]">{selectedDateLabel}</p>
            <button
              onClick={onNextDay}
              aria-label="Next day"
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
            >
              ›
            </button>
            {!isToday && (
              <button
                onClick={onToday}
                className="ml-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onAddSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Schedule
          </button>
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {isToday ? "Today's Schedules" : 'Schedules'}
          </h3>
          <p className="text-3xl font-bold text-blue-600">{schedules.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Pending Tasks
          </h3>
          <p className="text-3xl font-bold text-orange-600">{pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Completed Tasks
          </h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>
      </div>

      {/* Schedule for selected date */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isToday ? "Today's Schedule" : `Schedule — ${selectedDateLabel}`}
          </h2>
        </div>
        <div className="p-6">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No schedules for {isToday ? 'today' : 'this day'}
            </p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.dateTime}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                  style={{ borderLeft: `4px solid ${schedule.color}` }}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {schedule.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatTime(schedule.startTime)} -{' '}
                      {formatTime(schedule.endTime)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full mr-3">
                    {schedule.category}
                  </span>
                  <button
                    onClick={() => onConvertToTask(schedule)}
                    title="Add to Tasks"
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  >
                    + Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
        </div>
        <div className="p-6">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.category} • {task.priority}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      task.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

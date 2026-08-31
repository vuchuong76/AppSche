'use client';

import { Schedule, Task } from '@/types';
import { formatTime } from '@/lib/utils';

interface DashboardProps {
  schedules: Schedule[];
  tasks: Task[];
  onAddSchedule: () => void;
  onAddTask: () => void;
}

export default function Dashboard({
  schedules,
  tasks,
  onAddSchedule,
  onAddTask,
}: DashboardProps) {
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
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
            Today's Schedules
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

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
        </div>
        <div className="p-6">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No schedules for today
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
                  <span className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full">
                    {schedule.category}
                  </span>
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

'use client';

import { useState } from 'react';
import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onAdd: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

type FilterType = 'ALL' | 'TODO' | 'COMPLETED';

export default function TaskList({ tasks, onAdd, onUpdate, onDelete }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true;
    if (filter === 'TODO') return task.status === 'TODO' || task.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return task.status === 'COMPLETED';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleComplete = (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    onUpdate(task.taskId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['ALL', 'TODO', 'COMPLETED'] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tasks found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div
                key={task.taskId}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => toggleComplete(task)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Task content */}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-gray-900 ${
                        task.status === 'COMPLETED' ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-600">
                        {task.category}
                      </span>
                      {task.deadline && (
                        <span className="text-sm text-gray-500">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(task.taskId)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

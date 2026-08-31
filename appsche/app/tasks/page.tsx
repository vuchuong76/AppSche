'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import { Task } from '@/types';
import { getAuthHeader } from '@/lib/auth';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (task: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        } as HeadersInit,
        body: JSON.stringify(task),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTasks();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        } as HeadersInit,
        body: JSON.stringify({ taskId, updates }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await response.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 p-8">
        <TaskList
          tasks={tasks}
          onAdd={() => setShowModal(true)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </main>

      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}

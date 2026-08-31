'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ScheduleModal from '@/components/ScheduleModal';
import TaskModal from '@/components/TaskModal';
import { Schedule, Task } from '@/types';
import { getTodayString } from '@/lib/utils';
import { getAuthHeader, isAuthenticated } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Fetch today's schedules
  const fetchSchedules = async () => {
    try {
      const today = getTodayString();
      console.log('📅 [Dashboard] Fetching schedules for today:', today);
      const response = await fetch(`/api/schedules?date=${today}`, {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await response.json();
      console.log('📊 [Dashboard] API response:', data);
      if (data.success) {
        console.log(`✅ [Dashboard] Loaded ${data.data.length} schedules for ${today}`);
        setSchedules(data.data);
      } else {
        console.error('❌ [Dashboard] Fetch failed:', data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

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
    }
  };

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      console.log('⚠️ [Dashboard] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const loadData = async () => {
      await Promise.all([fetchSchedules(), fetchTasks()]);
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleAddSchedule = async (schedule: any) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        } as HeadersInit,
        body: JSON.stringify(schedule),
      });
      const data = await response.json();
      if (data.success) {
        await fetchSchedules();
        setShowScheduleModal(false);
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
    }
  };

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
        setShowTaskModal(false);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
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
        <Dashboard
          schedules={schedules}
          tasks={tasks}
          onAddSchedule={() => setShowScheduleModal(true)}
          onAddTask={() => setShowTaskModal(true)}
        />
      </main>

      <ScheduleModal
        isOpen={showScheduleModal}
        initialDate={getTodayString()}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleAddSchedule}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}

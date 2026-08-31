'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import ScheduleModal from '@/components/ScheduleModal';
import BulkImportModal from '@/components/BulkImportModal';
import TemplateModal from '@/components/TemplateModal';
import { Schedule } from '@/types';
import { getAuthHeader } from '@/lib/auth';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules', {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowModal(true);
  };

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
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
    }
  };

  const handleBulkImport = async (schedules: any[]) => {
    try {
      // Import all schedules
      const promises = schedules.map(schedule =>
        fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          } as HeadersInit,
          body: JSON.stringify(schedule),
        })
      );

      await Promise.all(promises);
      await fetchSchedules();
      setShowBulkImport(false);
    } catch (error) {
      console.error('Failed to bulk import:', error);
    }
  };

  const handleApplyTemplate = async (schedules: any[]) => {
    try {
      const promises = schedules.map(schedule =>
        fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          } as HeadersInit,
          body: JSON.stringify(schedule),
        })
      );

      await Promise.all(promises);
      await fetchSchedules();
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to apply template:', error);
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
        {/* Action Buttons */}
        <div className="mb-6 flex space-x-3">
          <button
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>📋</span>
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <span>📑</span>
            <span>Templates</span>
          </button>
        </div>

        <Calendar schedules={schedules} onDateClick={handleDateClick} />
      </main>

      <ScheduleModal
        isOpen={showModal}
        initialDate={selectedDate}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddSchedule}
      />

      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
      />

      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}

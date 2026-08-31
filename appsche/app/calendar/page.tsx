'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import ScheduleModal from '@/components/ScheduleModal';
import BulkImportModal from '@/components/BulkImportModal';
import TemplateModal from '@/components/TemplateModal';
import Toast from '@/components/Toast';
import { Schedule } from '@/types';
import { getAuthHeader, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [importing, setImporting] = useState(false);

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      console.log('🔄 Fetching schedules...');
      const response = await fetch('/api/schedules', {
        headers: getAuthHeader() as HeadersInit,
      });
      const data = await response.json();
      console.log('📊 Fetched schedules:', data);
      if (data.success) {
        console.log(`✅ Loaded ${data.data.length} schedules from DB`);
        setSchedules(data.data);
      } else {
        console.error('❌ Fetch failed:', data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchSchedules();
  }, [router]);

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
    // Check authentication first
    if (!isAuthenticated()) {
      setToast({
        message: '🔒 Session expired. Please login again.',
        type: 'error',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    setImporting(true);
    console.log('🚀 Starting bulk import with schedules:', schedules);
    console.log('🔐 Auth header:', getAuthHeader());

    try {
      // Import all schedules
      const promises = schedules.map(schedule => {
        console.log('📤 Sending schedule:', schedule);
        return fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          } as HeadersInit,
          body: JSON.stringify(schedule),
        })
      );

      const results = await Promise.all(promises);
      console.log('📥 Import results:', results.map(r => ({ status: r.status, ok: r.ok })));

      // Check if all succeeded
      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        setToast({
          message: `✨ Successfully imported ${schedules.length} schedules!`,
          type: 'success',
        });
      } else {
        const successCount = results.filter(r => r.ok).length;

        // Get error details from first failed request
        const failedResult = results.find(r => !r.ok);
        let errorDetail = '';
        if (failedResult) {
          try {
            const errorData = await failedResult.json();
            errorDetail = errorData.error || errorData.message || '';
            console.error('Import error details:', errorData);
          } catch (e) {
            errorDetail = `Status ${failedResult.status}`;
          }
        }

        setToast({
          message: `⚠️ Imported ${successCount}/${schedules.length} schedules. Error: ${errorDetail}`,
          type: 'error',
        });
      }

      await fetchSchedules();
      setShowBulkImport(false);
    } catch (error) {
      console.error('Failed to bulk import:', error);
      setToast({
        message: `❌ Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleApplyTemplate = async (schedules: any[]) => {
    // Check authentication first
    if (!isAuthenticated()) {
      setToast({
        message: '🔒 Session expired. Please login again.',
        type: 'error',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    setImporting(true);
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

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        setToast({
          message: `🎉 Template applied! ${schedules.length} schedules created.`,
          type: 'success',
        });
      } else {
        const successCount = results.filter(r => r.ok).length;
        setToast({
          message: `⚠️ Applied ${successCount}/${schedules.length} schedules`,
          type: 'error',
        });
      }

      await fetchSchedules();
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to apply template:', error);
      setToast({
        message: '❌ Failed to apply template. Please try again.',
        type: 'error',
      });
    } finally {
      setImporting(false);
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Loading Overlay */}
      {importing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Importing schedules...</p>
          </div>
        </div>
      )}
    </div>
  );
}

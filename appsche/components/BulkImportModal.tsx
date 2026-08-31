'use client';

import { useState } from 'react';
import { parseScheduleText, validateSchedule, formatSchedulePreview, ParsedSchedule } from '@/lib/scheduleParser';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (schedules: Array<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: string;
  }>) => void;
}

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [parsed, setParsed] = useState<ParsedSchedule[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const handleParse = () => {
    setError('');

    if (!text.trim()) {
      setError('Please paste your schedule text');
      return;
    }

    if (!date) {
      setError('Please select a date');
      return;
    }

    try {
      const schedules = parseScheduleText(text);

      if (schedules.length === 0) {
        setError('No valid schedules found. Make sure to use format: "6:00-7:00 Activity name"');
        return;
      }

      // Validate all schedules
      for (const schedule of schedules) {
        const validation = validateSchedule(schedule);
        if (!validation.valid) {
          setError(`Invalid schedule: ${validation.error}`);
          return;
        }
      }

      setParsed(schedules);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to parse schedules. Please check your format.');
    }
  };

  const handleImport = () => {
    const schedulesWithDate = parsed.map(s => ({
      ...s,
      date,
    }));

    onImport(schedulesWithDate);
    handleClose();
  };

  const handleClose = () => {
    setText('');
    setDate('');
    setParsed([]);
    setShowPreview(false);
    setError('');
    onClose();
  };

  const handleRemoveSchedule = (index: number) => {
    setParsed(parsed.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">📋 Bulk Import Schedules</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Paste your schedule in format: <code className="bg-gray-100 px-2 py-1 rounded">6:00-7:00 Activity name</code>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {!showPreview ? (
            <>
              {/* Input Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date for all schedules *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paste your schedule here *
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="6:00-7:00 Dậy, nấu cơm sáng cho gia đình&#10;7:00-7:30 Ăn sáng cùng vợ & con&#10;7:30-8:00 Chuẩn bị con (mặc áo, vệ sinh)&#10;8:00-9:20 Đưa con daycare + Nghe podcast AWS&#10;9:40-12:00 Code & thiết kế kiến trúc (Deep Work)&#10;..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">💡 Tips:</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Use format: <code>6:00-7:00 Activity description</code></li>
                  <li>Keywords auto-detect category: "code" → work, "ăn" → cook, "con" → family</li>
                  <li>One schedule per line</li>
                  <li>You can review and edit before importing</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Preview Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Preview ({parsed.length} schedules found)
                </h3>

                <div className="space-y-2">
                  {parsed.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-gray-600">
                            {schedule.startTime}-{schedule.endTime}
                          </span>
                          <span className="text-gray-900">{schedule.title}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {schedule.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSchedule(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
                ✅ Ready to import {parsed.length} schedules for <strong>{date}</strong>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            {!showPreview ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Parse & Preview
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ← Back to Edit
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Import {parsed.length} Schedules
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

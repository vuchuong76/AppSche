'use client';

import { useState, useEffect } from 'react';

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  schedules: Array<{
    title: string;
    startTime: string;
    endTime: string;
    category: string;
  }>;
  createdAt: number;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (schedules: Array<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: string;
  }>) => void;
}

const SAMPLE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 'weekday',
    name: '🏢 Typical Weekday',
    description: 'Standard work day schedule with family time',
    schedules: [
      { title: 'Dậy, nấu cơm sáng', startTime: '06:00', endTime: '07:00', category: 'family' },
      { title: 'Ăn sáng cùng gia đình', startTime: '07:00', endTime: '07:30', category: 'family' },
      { title: 'Chuẩn bị con', startTime: '07:30', endTime: '08:00', category: 'family' },
      { title: 'Đưa con daycare + Podcast AWS', startTime: '08:00', endTime: '09:20', category: 'family' },
      { title: 'Deep Work - Code & Design', startTime: '09:40', endTime: '12:00', category: 'work' },
      { title: 'Ăn trưa', startTime: '12:00', endTime: '13:00', category: 'rest' },
      { title: 'Deep Work 2', startTime: '13:00', endTime: '18:30', category: 'work' },
      { title: 'Đi về nhà', startTime: '18:30', endTime: '19:55', category: 'rest' },
      { title: 'Thời gian với con', startTime: '19:55', endTime: '20:20', category: 'family' },
      { title: 'Nấu cơm tối', startTime: '20:20', endTime: '21:00', category: 'cook' },
      { title: 'Ăn tối + dọn dẹp', startTime: '21:00', endTime: '21:30', category: 'cook' },
      { title: 'Học AWS', startTime: '21:30', endTime: '23:00', category: 'learning' },
      { title: 'Chuẩn bị ngủ', startTime: '23:00', endTime: '24:00', category: 'rest' },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'weekend',
    name: '🏡 Weekend Relax',
    description: 'Relaxing weekend with family',
    schedules: [
      { title: 'Ngủ nướng', startTime: '07:00', endTime: '08:00', category: 'rest' },
      { title: 'Ăn sáng muộn', startTime: '08:00', endTime: '09:00', category: 'cook' },
      { title: 'Chơi với con', startTime: '09:00', endTime: '11:00', category: 'family' },
      { title: 'Đi chợ', startTime: '11:00', endTime: '12:00', category: 'family' },
      { title: 'Ăn trưa', startTime: '12:00', endTime: '13:00', category: 'cook' },
      { title: 'Nghỉ trưa', startTime: '13:00', endTime: '14:30', category: 'rest' },
      { title: 'Gym', startTime: '15:00', endTime: '16:30', category: 'exercise' },
      { title: 'Nấu ăn cùng gia đình', startTime: '18:00', endTime: '19:00', category: 'cook' },
      { title: 'Xem phim cùng gia đình', startTime: '20:00', endTime: '22:00', category: 'family' },
    ],
    createdAt: Date.now(),
  },
];

export default function TemplateModal({ isOpen, onClose, onApplyTemplate }: TemplateModalProps) {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [applyDate, setApplyDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('schedule_templates');
      if (saved) {
        const userTemplates = JSON.parse(saved);
        setTemplates([...SAMPLE_TEMPLATES, ...userTemplates]);
      } else {
        setTemplates(SAMPLE_TEMPLATES);
      }
    } catch {
      setTemplates(SAMPLE_TEMPLATES);
    }
  };

  const saveTemplate = (template: ScheduleTemplate) => {
    try {
      const saved = localStorage.getItem('schedule_templates');
      const userTemplates = saved ? JSON.parse(saved) : [];
      userTemplates.push(template);
      localStorage.setItem('schedule_templates', JSON.stringify(userTemplates));
      loadTemplates();
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const deleteTemplate = (id: string) => {
    try {
      const saved = localStorage.getItem('schedule_templates');
      if (saved) {
        const userTemplates = JSON.parse(saved).filter((t: ScheduleTemplate) => t.id !== id);
        localStorage.setItem('schedule_templates', JSON.stringify(userTemplates));
        loadTemplates();
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const handleApply = () => {
    if (!selectedTemplate || !applyDate) return;

    const schedulesWithDate = selectedTemplate.schedules.map(s => ({
      ...s,
      date: applyDate,
    }));

    onApplyTemplate(schedulesWithDate);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setApplyDate('');
    setShowCreateForm(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">📑 Schedule Templates</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Apply pre-made templates or create your own
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedTemplate ? (
            <>
              {/* Template List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {!SAMPLE_TEMPLATES.find(t => t.id === template.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-sm text-gray-500">
                      {template.schedules.length} schedules
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">
                  💡 To create a custom template, fill out your schedule for one day, then save it as a template from the calendar page
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Template Detail */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-blue-600 hover:text-blue-800 mb-4"
                >
                  ← Back to templates
                </button>

                <h3 className="text-xl font-semibold mb-2">{selectedTemplate.name}</h3>
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply to date: *
                  </label>
                  <input
                    type="date"
                    value={applyDate}
                    onChange={(e) => setApplyDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-3">Preview ({selectedTemplate.schedules.length} schedules):</h4>
                  <div className="space-y-2">
                    {selectedTemplate.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className="font-mono text-gray-600 w-24">
                          {schedule.startTime}-{schedule.endTime}
                        </span>
                        <span className="flex-1">{schedule.title}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {schedule.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            {selectedTemplate ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!applyDate}
                  className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Apply Template
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Assignment, Course, AssignmentType, Priority, TaskStatus, ASSIGNMENT_TYPE_LABELS, PRIORITY_LABELS, TASK_STATUS_LABELS } from '../types';
import { X, Calendar, Clock, AlertTriangle, Link, Trash2 } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asg: Assignment) => void;
  onDelete?: (id: string) => void;
  initialAssignment?: Assignment | null;
  courses: Course[];
  semesterId: string;
  preselectedCourseId?: string;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAssignment,
  courses,
  semesterId,
  preselectedCourseId,
}) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssignmentType>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (initialAssignment) {
      setCourseId(initialAssignment.courseId);
      setTitle(initialAssignment.title);
      setType(initialAssignment.type);
      setDueDate(initialAssignment.dueDate);
      setPriority(initialAssignment.priority);
      setStatus(initialAssignment.status);
      setDescription(initialAssignment.description || '');
      setLinkUrl(initialAssignment.linkUrl || '');
    } else {
      setCourseId(preselectedCourseId || (courses.length > 0 ? courses[0].id : ''));
      setTitle('');
      setType('assignment');

      // Default due date: 3 days later 23:59
      const target = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const yyyy = target.getFullYear();
      const mm = String(target.getMonth() + 1).padStart(2, '0');
      const dd = String(target.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}T23:59`);

      setPriority('medium');
      setStatus('todo');
      setDescription('');
      setLinkUrl('');
    }
  }, [initialAssignment, isOpen, preselectedCourseId, courses]);

  if (!isOpen) return null;

  const handleQuickDueDate = (daysFromNow: number) => {
    const target = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}T23:59`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const data: Assignment = {
      id: initialAssignment ? initialAssignment.id : `asg-${Date.now()}`,
      semesterId: initialAssignment ? initialAssignment.semesterId : semesterId,
      courseId,
      title: title.trim(),
      type,
      dueDate,
      priority,
      status,
      description: description.trim(),
      linkUrl: linkUrl.trim(),
      completedAt: status === 'done' ? (initialAssignment?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialAssignment ? '과제 / 일정 수정' : '새 과제 / 일정 등록'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Linked Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              해당 과목 <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
            >
              <option value="">일반 학업 / 기타 일정</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.professor || '교수 미지정'})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              과제 및 시험명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 다이나믹 프로그래밍 구현 과제, 텀프로젝트 중간 발표"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                항목 유형
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                중요도 (우선순위)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, item]) => (
                  <option key={k} value={k}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>마감 일시 <span className="text-rose-500">*</span></span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(0)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(1)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                >
                  내일
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(3)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                >
                  3일 뒤
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(7)}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                >
                  1주일 뒤
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              진행 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    status === s
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {TASK_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              상세 요구사항 및 메모
            </label>
            <textarea
              rows={3}
              placeholder="예: A4 5장 분량, 폰트 11pt, PDF 제출. GitHub 리포지토리 링크 첨부 필수."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submission URL / Link */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>제출처 웹사이트 URL (선택)</span>
            </label>
            <input
              type="url"
              placeholder="https://lms.university.ac.kr/course/123"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {initialAssignment && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('이 과제를 삭제하시겠습니까?')) {
                    onDelete(initialAssignment.id);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                삭제하기
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

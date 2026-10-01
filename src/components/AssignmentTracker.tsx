import React, { useState } from 'react';
import { Assignment, Course, AssignmentType, TaskStatus, Priority, ASSIGNMENT_TYPE_LABELS, PRIORITY_LABELS, TASK_STATUS_LABELS } from '../types';
import { getDDayInfo, formatKoreanDateTime } from '../utils';
import { CheckCircle2, Circle, Clock, Search, Filter, Plus, ExternalLink, Calendar, Trash2, Edit2, LayoutList, Columns } from 'lucide-react';

interface AssignmentTrackerProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: () => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onToggleStatus: (id: string, newStatus: TaskStatus) => void;
}

export const AssignmentTracker: React.FC<AssignmentTrackerProps> = ({
  assignments,
  courses,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onToggleStatus,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('active'); // 'all' | 'active' | 'done' | 'urgent'
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'due_asc' | 'priority' | 'course'>('due_asc');

  // Filter and sort assignments
  const filtered = assignments.filter((asg) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const course = courses.find((c) => c.id === asg.courseId);
      const matchesTitle = asg.title.toLowerCase().includes(q);
      const matchesCourse = course?.name.toLowerCase().includes(q);
      const matchesDesc = asg.description?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
    }

    // Status
    if (filterStatus === 'active' && asg.status === 'done') return false;
    if (filterStatus === 'done' && asg.status !== 'done') return false;
    if (filterStatus === 'urgent') {
      if (asg.status === 'done') return false;
      const dday = getDDayInfo(asg.dueDate);
      if (dday.diffDays > 3) return false;
    }

    // Course
    if (filterCourse !== 'all' && asg.courseId !== filterCourse) return false;

    // Type
    if (filterType !== 'all' && asg.type !== filterType) return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'due_asc') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const pOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    }
    if (sortBy === 'course') {
      const cA = courses.find((c) => c.id === a.courseId)?.name || '';
      const cB = courses.find((c) => c.id === b.courseId)?.name || '';
      return cA.localeCompare(cB);
    }
    return 0;
  });

  // Quick stats
  const totalCount = assignments.length;
  const activeCount = assignments.filter((a) => a.status !== 'done').length;
  const doneCount = assignments.filter((a) => a.status === 'done').length;
  const urgentCount = assignments.filter((a) => a.status !== 'done' && getDDayInfo(a.dueDate).diffDays <= 3).length;

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">과제 및 시험 일정 관리</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              전체 <strong className="text-slate-900 font-semibold">{totalCount}</strong>건 · 진행 중{' '}
              <strong className="text-indigo-600 font-semibold">{activeCount}</strong>건 · 마감 임박{' '}
              <strong className="text-rose-600 font-semibold">{urgentCount}</strong>건 · 완료{' '}
              <strong className="text-emerald-600 font-semibold">{doneCount}</strong>건
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="목록 보기"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="칸반 보드 보기"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onAddAssignment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>과제 추가</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="과제명, 과목명, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status filter tabs */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">진행 중 & 대기 중 ({activeCount})</option>
            <option value="urgent">마감 임박 (3일 이내) ({urgentCount})</option>
            <option value="all">전체 상태 ({totalCount})</option>
            <option value="done">완료됨 ({doneCount})</option>
          </select>

          {/* Course filter */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">모든 과목</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="due_asc">마감일 빠른 순</option>
            <option value="priority">우선순위(중요도) 순</option>
            <option value="course">과목명 순</option>
          </select>
        </div>
      </div>

      {/* Main Content: List or Kanban */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {sorted.map((asg) => {
              const course = courses.find((c) => c.id === asg.courseId);
              const dday = getDDayInfo(asg.dueDate);
              const isCompleted = asg.status === 'done';

              return (
                <div
                  key={asg.id}
                  className={`p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isCompleted ? 'bg-slate-50/40 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Checkbox toggle */}
                    <button
                      onClick={() => onToggleStatus(asg.id, isCompleted ? 'in_progress' : 'done')}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                      title={isCompleted ? '진행 중으로 변경' : '완료로 표시'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-700">
                          {course?.name || '일반 학업'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          {ASSIGNMENT_TYPE_LABELS[asg.type]}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-[11px] font-mono px-2 py-0.2 rounded border ${PRIORITY_LABELS[asg.priority].color}`}>
                          {PRIORITY_LABELS[asg.priority].label}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-semibold mt-1 text-slate-900 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {asg.title}
                      </h4>

                      {asg.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 bg-slate-50/60 p-2 rounded border border-slate-100">
                          {asg.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          마감: {formatKoreanDateTime(asg.dueDate)}
                        </span>

                        {asg.linkUrl && (
                          <a
                            href={asg.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>제출 링크</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & D-Day status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                    <span className={`text-xs font-medium font-mono px-2.5 py-1 rounded-md border ${dday.colorClass}`}>
                      {isCompleted ? '제출 완료' : dday.text}
                    </span>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditAssignment(asg)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="과제 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAssignment(asg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="과제 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {sorted.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm font-medium">해당 조건에 일치하는 과제가 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">필터를 변경하거나 새로운 과제를 등록해보세요.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((statusKey) => {
            const columnItems = sorted.filter((a) => a.status === statusKey);
            const statusTitle = TASK_STATUS_LABELS[statusKey];

            return (
              <div key={statusKey} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col h-full">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {statusKey === 'todo' && <Circle className="w-3.5 h-3.5 text-slate-400" />}
                    {statusKey === 'in_progress' && <Clock className="w-3.5 h-3.5 text-indigo-500" />}
                    {statusKey === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {statusTitle}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {columnItems.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {columnItems.map((asg) => {
                    const course = courses.find((c) => c.id === asg.courseId);
                    const dday = getDDayInfo(asg.dueDate);

                    return (
                      <div
                        key={asg.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs hover:border-indigo-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-indigo-700 truncate max-w-[150px]">
                            {course?.name || '일반'}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${dday.colorClass}`}>
                            {asg.status === 'done' ? '완료' : dday.text}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                          {asg.title}
                        </h5>

                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatKoreanDateTime(asg.dueDate)}
                        </div>

                        {/* Quick Kanban Status buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {statusKey !== 'todo' && (
                              <button
                                onClick={() => onToggleStatus(asg.id, 'todo')}
                                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
                              >
                                대기
                              </button>
                            )}
                            {statusKey !== 'in_progress' && (
                              <button
                                onClick={() => onToggleStatus(asg.id, 'in_progress')}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors"
                              >
                                진행
                              </button>
                            )}
                            {statusKey !== 'done' && (
                              <button
                                onClick={() => onToggleStatus(asg.id, 'done')}
                                className="text-[10px] text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors"
                              >
                                완료
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditAssignment(asg)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="수정"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteAssignment(asg.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnItems.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      과제 없음
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

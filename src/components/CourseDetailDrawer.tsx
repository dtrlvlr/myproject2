import React from 'react';
import { Course, Assignment, CATEGORY_LABELS, DAY_NAMES_KO, COURSE_COLOR_PALETTES, ASSIGNMENT_TYPE_LABELS } from '../types';
import { getDDayInfo, formatKoreanDateTime } from '../utils';
import { X, Clock, MapPin, User, BookOpen, Edit2, Trash2, Plus, ExternalLink, CheckCircle2, Circle } from 'lucide-react';

interface CourseDetailDrawerProps {
  course: Course | null;
  assignments: Assignment[];
  onClose: () => void;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onAddAssignmentForCourse: (courseId: string) => void;
  onToggleAssignmentStatus: (assignmentId: string, currentStatus: any) => void;
}

export const CourseDetailDrawer: React.FC<CourseDetailDrawerProps> = ({
  course,
  assignments,
  onClose,
  onEdit,
  onDelete,
  onAddAssignmentForCourse,
  onToggleAssignmentStatus,
}) => {
  if (!course) return null;

  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const palette = COURSE_COLOR_PALETTES.find((p) => p.id === course.colorId) || COURSE_COLOR_PALETTES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className={`p-6 border-b border-slate-200 ${palette.lightBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
              {CATEGORY_LABELS[course.category]} · {course.credits}학점
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-2">
            {course.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-700">
            {course.professor && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{course.professor}</span>
              </span>
            )}
            {course.room && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{course.room}</span>
              </span>
            )}
            {course.grade && (
              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                취득 성적: {course.grade}
              </span>
            )}
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lecture Time Slots */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>강의 시간표</span>
            </h4>
            <div className="space-y-2">
              {course.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                >
                  <span className="font-semibold text-slate-800">
                    {DAY_NAMES_KO[slot.day]}
                  </span>
                  <span className="font-mono text-slate-600 font-medium">
                    {slot.startTime} ~ {slot.endTime}
                  </span>
                  <span className="text-slate-500">
                    {slot.room || course.room || '강의실 미정'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Memo / Syllabus */}
          {course.memo && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>수업 메모 및 공지</span>
              </h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {course.memo}
              </div>
            </div>
          )}

          {/* Linked Assignments & Exams */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900">
                과제 및 시험 일정 ({courseAssignments.length}건)
              </h4>
              <button
                onClick={() => onAddAssignmentForCourse(course.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>과제 추가</span>
              </button>
            </div>

            <div className="space-y-2">
              {courseAssignments.map((asg) => {
                const dday = getDDayInfo(asg.dueDate);
                const isCompleted = asg.status === 'done';

                return (
                  <div
                    key={asg.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => onToggleAssignmentStatus(asg.id, isCompleted ? 'in_progress' : 'done')}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {asg.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {ASSIGNMENT_TYPE_LABELS[asg.type]} · {formatKoreanDateTime(asg.dueDate)}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${dday.colorClass}`}>
                        {isCompleted ? '완료' : dday.text}
                      </span>
                    </div>
                  </div>
                );
              })}

              {courseAssignments.length === 0 && (
                <p className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  등록된 과제나 시험 일정이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`'${course.name}' 강의를 삭제하시겠습니까?`)) {
                onDelete(course.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>강의 삭제</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(course);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>강의 수정</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Course, CourseCategory, DayOfWeek, TimeSlot, COURSE_COLOR_PALETTES, CATEGORY_LABELS, DAY_SHORT_KO } from '../types';
import { X, Plus, Trash2, Clock, Palette } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  initialCourse?: Course | null;
  semesterId: string;
  prefillDay?: DayOfWeek;
  prefillStartTime?: string;
}

const KOREAN_PERIOD_PRESETS = [
  { name: '1교시 (09:00~10:15)', start: '09:00', end: '10:15' },
  { name: '2교시 (10:30~11:45)', start: '10:30', end: '11:45' },
  { name: '3교시 (12:00~13:15)', start: '12:00', end: '13:15' },
  { name: '4교시 (13:30~14:45)', start: '13:30', end: '14:45' },
  { name: '5교시 (15:00~16:15)', start: '15:00', end: '16:15' },
  { name: '6교시 (16:30~17:45)', start: '16:30', end: '17:45' },
  { name: '야간 (18:00~20:45)', start: '18:00', end: '20:45' },
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCourse,
  semesterId,
  prefillDay,
  prefillStartTime,
}) => {
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [category, setCategory] = useState<CourseCategory>('major_required');
  const [colorId, setColorId] = useState<string>('indigo');
  const [memo, setMemo] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (initialCourse) {
      setName(initialCourse.name);
      setProfessor(initialCourse.professor || '');
      setRoom(initialCourse.room || '');
      setCredits(initialCourse.credits);
      setCategory(initialCourse.category);
      setColorId(initialCourse.colorId || 'indigo');
      setMemo(initialCourse.memo || '');
      setSlots(initialCourse.slots.length > 0 ? initialCourse.slots : [
        { id: `slot-${Date.now()}`, day: 'mon', startTime: '09:00', endTime: '10:30' },
      ]);
    } else {
      // New course defaults
      setName('');
      setProfessor('');
      setRoom('');
      setCredits(3);
      setCategory('major_required');
      // Pick random color palette
      const randomColor = COURSE_COLOR_PALETTES[Math.floor(Math.random() * COURSE_COLOR_PALETTES.length)].id;
      setColorId(randomColor);
      setMemo('');

      const defaultDay = prefillDay || 'mon';
      const defaultStart = prefillStartTime || '09:00';
      // Calculate 1.5h later
      const [sh] = defaultStart.split(':').map(Number);
      const defaultEnd = `${String(sh + 1).padStart(2, '0')}:30`;

      setSlots([
        {
          id: `slot-${Date.now()}`,
          day: defaultDay,
          startTime: defaultStart,
          endTime: defaultEnd,
        },
      ]);
    }
  }, [initialCourse, isOpen, prefillDay, prefillStartTime]);

  if (!isOpen) return null;

  const handleAddSlot = () => {
    setSlots([
      ...slots,
      {
        id: `slot-${Date.now()}-${Math.random()}`,
        day: 'wed',
        startTime: '10:30',
        endTime: '12:00',
      },
    ]);
  };

  const handleRemoveSlot = (slotId: string) => {
    if (slots.length <= 1) return;
    setSlots(slots.filter((s) => s.id !== slotId));
  };

  const handleUpdateSlot = (slotId: string, updated: Partial<TimeSlot>) => {
    setSlots(
      slots.map((s) => (s.id === slotId ? { ...s, ...updated } : s))
    );
  };

  const handleApplyPreset = (slotId: string, start: string, end: string) => {
    handleUpdateSlot(slotId, { startTime: start, endTime: end });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const courseData: Course = {
      id: initialCourse ? initialCourse.id : `course-${Date.now()}`,
      semesterId: initialCourse ? initialCourse.semesterId : semesterId,
      name: name.trim(),
      professor: professor.trim(),
      room: room.trim(),
      credits,
      category,
      colorId,
      memo: memo.trim(),
      slots,
      grade: initialCourse?.grade,
      isRetake: initialCourse?.isRetake,
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialCourse ? '강의 정보 수정' : '새 강의 등록'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Course Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              과목명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 자료구조, 운영체제, 기초교양영어"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Professor & Classroom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                담당 교수
              </label>
              <input
                type="text"
                placeholder="예: 김민수 교수"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                강의실 / 건물
              </label>
              <input
                type="text"
                placeholder="예: IT관 301호"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Credits & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                학점
              </label>
              <select
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1학점</option>
                <option value={2}>2학점</option>
                <option value={3}>3학점</option>
                <option value={4}>4학점</option>
                <option value={5}>5학점</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                이수구분
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>시간표 색상 테마</span>
            </label>
            <div className="flex items-center gap-2">
              {COURSE_COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setColorId(pal.id)}
                  title={pal.name}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${pal.bg} ${
                    colorId === pal.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>강의 시간 ({slots.length}회)</span>
              </label>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>시간 추가</span>
              </button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, idx) => (
                <div key={slot.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      수업 {idx + 1}
                    </span>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="이 시간 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={slot.day}
                      onChange={(e) => handleUpdateSlot(slot.id, { day: e.target.value as DayOfWeek })}
                      className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-md font-semibold"
                    >
                      {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayOfWeek[]).map((d) => (
                        <option key={d} value={d}>
                          {DAY_SHORT_KO[d]}요일
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleUpdateSlot(slot.id, { startTime: e.target.value })}
                      className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleUpdateSlot(slot.id, { endTime: e.target.value })}
                      className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  {/* Korean Period Presets */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">교시 프리셋:</span>
                    {KOREAN_PERIOD_PRESETS.slice(0, 5).map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(slot.id, preset.start, preset.end)}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-600 transition-colors"
                      >
                        {preset.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memo / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              강의 메모 / 평가 비율 / 참고사항
            </label>
            <textarea
              rows={2}
              placeholder="예: 출석 10%, 과제 30%, 중간 30%, 기말 30%. 실습 준비물 필요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {initialCourse && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`'${initialCourse.name}' 강의를 삭제하시겠습니까? 관련된 과제는 유지됩니다.`)) {
                    onDelete(initialCourse.id);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                강의 삭제
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

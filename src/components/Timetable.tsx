import React, { useState } from 'react';
import { Course, DayOfWeek, DAY_SHORT_KO, DAY_NAMES_KO, COURSE_COLOR_PALETTES, CATEGORY_LABELS } from '../types';
import { timeToMinutes, findScheduleConflicts, calculateFreePeriods } from '../utils';
import { AlertCircle, Plus, Eye, List, Grid3X3, Printer, Sparkles, MapPin, User, BookOpen, FileSpreadsheet } from 'lucide-react';

interface TimetableProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onAddCourseAtSlot?: (day: DayOfWeek, startTime: string) => void;
  onEditCourse: (course: Course) => void;
  onExportExcel?: () => void;
}

export const Timetable: React.FC<TimetableProps> = ({
  courses,
  onSelectCourse,
  onAddCourseAtSlot,
  onEditCourse,
  onExportExcel,
}) => {
  const [includeSaturday, setIncludeSaturday] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Days to show
  const days: DayOfWeek[] = includeSaturday
    ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    : ['mon', 'tue', 'wed', 'thu', 'fri'];

  // Calculate dynamic start and end hour based on courses
  const allMinutes: number[] = [];
  courses.forEach((c) => {
    c.slots.forEach((s) => {
      allMinutes.push(timeToMinutes(s.startTime));
      allMinutes.push(timeToMinutes(s.endTime));
    });
  });

  const minHour = allMinutes.length > 0 ? Math.max(8, Math.min(9, Math.floor(Math.min(...allMinutes) / 60))) : 9;
  const maxHour = allMinutes.length > 0 ? Math.min(22, Math.max(18, Math.ceil(Math.max(...allMinutes) / 60))) : 18;

  const hours: number[] = [];
  for (let h = minHour; h <= maxHour; h++) {
    hours.push(h);
  }

  const conflicts = findScheduleConflicts(courses);

  // Free day detection (요일별 수업 유무)
  const freeDays = days.filter((d) => {
    return !courses.some((c) => c.slots.some((s) => s.day === d));
  });

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);

  // Palette lookup helper
  const getColorClasses = (colorId: string) => {
    const p = COURSE_COLOR_PALETTES.find((pal) => pal.id === colorId) || COURSE_COLOR_PALETTES[0];
    return p;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">시간표</span>
            <span className="text-xs text-slate-500 font-mono">
              (총 <strong className="text-indigo-600 font-semibold">{totalCredits}</strong>학점 / {courses.length}과목)
            </span>
          </div>

          {freeDays.length > 0 && (
            <div className="hidden md:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>
                {freeDays.map((d) => DAY_SHORT_KO[d]).join(', ')}요일 공강
              </span>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>시간표 중복 {conflicts.length}건 발생</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Saturday toggle */}
          <button
            onClick={() => setIncludeSaturday(!includeSaturday)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              includeSaturday
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            토요일 {includeSaturday ? '숨기기' : '포함'}
          </button>

          {/* View toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="시간표 그리드 뷰"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="강의 목록 뷰"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="시간표 인쇄 / PDF 저장"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Excel Export button */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
              title="시간표 및 수강 목록 엑셀(.xlsx) 파일 다운로드"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Day Headers */}
          <div
            className="grid border-b border-slate-200 bg-slate-50 text-center"
            style={{
              gridTemplateColumns: `60px repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="py-3 text-xs font-medium text-slate-400 border-r border-slate-200 flex items-center justify-center">
              시간
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="py-3 px-2 border-r last:border-r-0 border-slate-200 text-xs font-semibold text-slate-700"
              >
                <span>{DAY_NAMES_KO[day]}</span>
              </div>
            ))}
          </div>

          {/* Timetable Body Canvas */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `60px repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            {/* Time labels column */}
            <div className="border-r border-slate-200 bg-slate-50/50">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-16 border-b border-slate-100 text-[11px] font-mono text-slate-400 text-right pr-2 pt-1 select-none"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              // Get slots for this day
              const daySlots: { course: Course; slot: Course['slots'][0] }[] = [];
              courses.forEach((c) => {
                c.slots.forEach((s) => {
                  if (s.day === day) {
                    daySlots.push({ course: c, slot: s });
                  }
                });
              });

              return (
                <div
                  key={day}
                  className="relative border-r last:border-r-0 border-slate-200"
                  style={{ height: `${hours.length * 64}px` }}
                >
                  {/* Hour background guide lines */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      onClick={() =>
                        onAddCourseAtSlot && onAddCourseAtSlot(day, `${String(h).padStart(2, '0')}:00`)
                      }
                      title={`${DAY_SHORT_KO[day]}요일 ${String(h).padStart(2, '0')}:00 클릭하여 강의 추가`}
                      className="h-16 border-b border-slate-100 hover:bg-indigo-50/20 cursor-pointer transition-colors"
                    />
                  ))}

                  {/* Render Lecture blocks */}
                  {daySlots.map(({ course, slot }) => {
                    const startMin = timeToMinutes(slot.startTime);
                    const endMin = timeToMinutes(slot.endTime);
                    const baseMin = minHour * 60;
                    const totalDurationMin = hours.length * 60;

                    const topPx = ((startMin - baseMin) / 60) * 64;
                    const heightPx = Math.max(34, ((endMin - startMin) / 60) * 64 - 2);

                    const palette = getColorClasses(course.colorId);

                    return (
                      <div
                        key={slot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(course);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                        className={`absolute left-1 right-1 rounded-lg p-2 border overflow-hidden cursor-pointer transition-all hover:shadow-md hover:z-20 ${palette.lightBg} ${palette.border} group`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-xs font-bold leading-tight line-clamp-2 ${palette.text}`}>
                            {course.name}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-600">
                          {(slot.room || course.room) && (
                            <span className="flex items-center gap-1 truncate text-slate-500">
                              <MapPin className="w-2.5 h-2.5 shrink-0 opacity-70" />
                              <span className="truncate">{slot.room || course.room}</span>
                            </span>
                          )}

                          {course.professor && (
                            <span className="flex items-center gap-1 truncate text-slate-500">
                              <User className="w-2.5 h-2.5 shrink-0 opacity-70" />
                              <span className="truncate">{course.professor}</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-[10px] font-mono text-slate-400 group-hover:text-slate-600">
                          {slot.startTime} ~ {slot.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">등록된 강의 목록 ({courses.length}개)</h3>
            <span className="text-xs text-slate-500">클릭하여 강의 정보 수정 및 상세 확인</span>
          </div>

          <div className="divide-y divide-slate-100">
            {courses.map((course) => {
              const palette = getColorClasses(course.colorId);
              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${palette.bg}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{course.name}</h4>
                        <span className="text-xs text-slate-500">
                          {CATEGORY_LABELS[course.category]} · {course.credits}학점
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {course.professor} · {course.room}
                      </p>
                      {course.memo && (
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 bg-slate-50 p-1.5 rounded">
                          {course.memo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 shrink-0 pl-6 sm:pl-0">
                    {course.slots.map((s) => (
                      <span key={s.id} className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {DAY_SHORT_KO[s.day]} {s.startTime}~{s.endTime} {s.room ? `(${s.room})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                등록된 강의가 없습니다. 오른쪽 상단 '강의 등록' 버튼을 눌러 강의를 추가해보세요!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

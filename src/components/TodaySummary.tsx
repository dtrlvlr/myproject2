import React from 'react';
import { Course, Assignment, DayOfWeek } from '../types';
import { calculateFreePeriods, getDDayInfo, timeToMinutes } from '../utils';
import { Clock, BookOpen, AlertTriangle, Coffee, ArrowRight } from 'lucide-react';

interface TodaySummaryProps {
  courses: Course[];
  assignments: Assignment[];
  onSelectCourse: (course: Course) => void;
  onNavigateToAssignments: () => void;
}

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun' as any,
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

export const TodaySummary: React.FC<TodaySummaryProps> = ({
  courses,
  assignments,
  onSelectCourse,
  onNavigateToAssignments,
}) => {
  const now = new Date();
  const todayDayIndex = now.getDay();
  const currentDayKey = DAY_MAP[todayDayIndex];
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

  // Courses today
  const todayCourseSlots: { course: Course; startTime: string; endTime: string; room?: string }[] = [];
  courses.forEach((c) => {
    c.slots.forEach((s) => {
      if (s.day === currentDayKey) {
        todayCourseSlots.push({
          course: c,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || c.room,
        });
      }
    });
  });

  todayCourseSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Next upcoming class today
  const upcomingClass = todayCourseSlots.find((s) => timeToMinutes(s.endTime) > currentTimeMinutes);
  const isOngoing = upcomingClass && timeToMinutes(upcomingClass.startTime) <= currentTimeMinutes && timeToMinutes(upcomingClass.endTime) >= currentTimeMinutes;

  // Free periods today
  const freePeriodInfo = calculateFreePeriods(courses, currentDayKey);
  const freeHours = (freePeriodInfo.freeMinutes / 60).toFixed(1);

  // Urgent assignments (D-3 or less, not done)
  const urgentAssignments = assignments
    .filter((a) => a.status !== 'done')
    .map((a) => ({ assignment: a, dday: getDDayInfo(a.dueDate) }))
    .filter((item) => item.dday.diffDays <= 3)
    .sort((a, b) => a.dday.diffDays - b.dday.diffDays);

  // Date format
  const dateFormatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${
    ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][todayDayIndex]
  }`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-indigo-600 tracking-wide">학업 대시보드</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{dateFormatted}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>오늘 강의 <strong className="font-semibold text-slate-900 font-mono tabular-nums">{todayCourseSlots.length}</strong>개</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>오늘 공강 <strong className="font-semibold text-slate-900 font-mono tabular-nums">{freeHours}</strong>시간</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>마감 임박 <strong className="font-semibold text-rose-600 font-mono tabular-nums">{urgentAssignments.length}</strong>건</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Next class or today's schedule */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">오늘의 다음 강의</span>
            {isOngoing ? (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">수업 진행 중</span>
            ) : upcomingClass ? (
              <span className="text-[11px] font-mono text-indigo-600">
                {upcomingClass.startTime} 시작
              </span>
            ) : null}
          </div>

          {upcomingClass ? (
            <div
              onClick={() => onSelectCourse(upcomingClass.course)}
              className="group cursor-pointer flex items-center justify-between p-2 rounded-md hover:bg-white hover:shadow-xs transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {upcomingClass.course.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {upcomingClass.startTime} ~ {upcomingClass.endTime} · {upcomingClass.room} · {upcomingClass.course.professor}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          ) : todayCourseSlots.length > 0 ? (
            <p className="text-xs text-slate-500 py-2">오늘 예정된 모든 수업이 종료되었습니다. 수고하셨습니다!</p>
          ) : (
            <p className="text-xs text-slate-500 py-2">오늘은 수업이 없는 날(통공강/주말)입니다! 여유로운 하루를 보내세요.</p>
          )}
        </div>

        {/* Immediate deadline */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">마감 임박 과제</span>
            <button
              onClick={onNavigateToAssignments}
              className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
            >
              전체 보기 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {urgentAssignments.length > 0 ? (
            <div className="space-y-2">
              {urgentAssignments.slice(0, 2).map(({ assignment, dday }) => {
                const course = courses.find((c) => c.id === assignment.courseId);
                return (
                  <div
                    key={assignment.id}
                    onClick={onNavigateToAssignments}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {assignment.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {course?.name || '일반'} · {assignment.dueDate.replace('T', ' ')}
                      </p>
                    </div>
                    <span className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded border shrink-0 ${dday.colorClass}`}>
                      {dday.text}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-2">현재 3일 이내에 마감되는 긴급 과제가 없습니다. 여유롭습니다!</p>
          )}
        </div>
      </div>
    </div>
  );
};

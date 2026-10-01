import React from 'react';
import { Course, Assignment, StudentProfile, CATEGORY_LABELS, DAY_NAMES_KO, DayOfWeek } from '../types';
import { calculateFreePeriods, timeToMinutes, getCategoryStats } from '../utils';
import { Clock, BookOpen, CheckCircle, PieChart, BarChart3, Coffee, Calendar, Compass } from 'lucide-react';

interface WeeklyAnalyticsProps {
  courses: Course[];
  assignments: Assignment[];
  profile: StudentProfile;
}

export const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({
  courses,
  assignments,
  profile,
}) => {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

  // Workload per day in hours
  const dailyWorkload = days.map((day) => {
    let dayMinutes = 0;
    courses.forEach((c) => {
      c.slots.forEach((s) => {
        if (s.day === day) {
          const duration = timeToMinutes(s.endTime) - timeToMinutes(s.startTime);
          dayMinutes += Math.max(0, duration);
        }
      });
    });

    const freeInfo = calculateFreePeriods(courses, day);

    return {
      day,
      name: DAY_NAMES_KO[day],
      classHours: Number((dayMinutes / 60).toFixed(1)),
      freeHours: Number((freeInfo.freeMinutes / 60).toFixed(1)),
      gaps: freeInfo.gaps,
    };
  });

  const maxDailyHours = Math.max(6, ...dailyWorkload.map((d) => d.classHours));
  const totalWeeklyClassHours = dailyWorkload.reduce((acc, d) => acc + d.classHours, 0);
  const totalWeeklyFreeHours = dailyWorkload.reduce((acc, d) => acc + d.freeHours, 0);

  // Category breakdown
  const categoryStats = getCategoryStats(courses);
  const totalCategoryCredits = courses.reduce((acc, c) => acc + c.credits, 0);

  // Assignment completion
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === 'done').length;
  const inProgressAssignments = assignments.filter((a) => a.status === 'in_progress').length;
  const todoAssignments = assignments.filter((a) => a.status === 'todo').length;
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">학습 패턴 및 주간 로드 분석</h2>
        <p className="text-xs text-slate-500 mt-1">
          수강 시간, 공강 분포, 과제 진척도와 이수 요건 달성 현황을 한눈에 파악합니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-500">주간 총 수업 시간</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {totalWeeklyClassHours}시간
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">주간 총 공강 시간</span>
            <div className="text-xl font-bold font-mono text-amber-600 mt-1">
              {totalWeeklyFreeHours}시간
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">이번 학기 수강 과목</span>
            <div className="text-xl font-bold font-mono text-indigo-600 mt-1">
              {courses.length}개 과목
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">과제 완료율</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Schedule Load Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>요일별 강의 및 공강 시간 분포</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              수업이 집중된 요일과 공강 시간을 확인하여 효율적인 공부/팀플 계획을 세울 수 있습니다.
            </p>

            <div className="space-y-4 mt-6">
              {dailyWorkload.map((item) => {
                const classPercent = (item.classHours / maxDailyHours) * 100;
                return (
                  <div key={item.day} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-2 font-mono text-slate-500">
                        <span>강의 {item.classHours}h</span>
                        {item.freeHours > 0 && (
                          <span className="text-amber-600 font-medium">· 공강 {item.freeHours}h</span>
                        )}
                        {item.classHours === 0 && <span className="text-emerald-600 font-medium">· 전일 공강</span>}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full rounded-l-full transition-all"
                        style={{ width: `${classPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600 shrink-0" />
              <span>수업 시간</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <span>공강 시간</span>
            </div>
          </div>
        </div>

        {/* Course Category Breakdown & Credit Composition */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>이수구분별 학점 비중</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700">총 {totalCategoryCredits}학점</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              전공 및 교양 이수 비율을 점검하여 졸업 요건 불균형을 사전에 예방합니다.
            </p>

            <div className="space-y-4 mt-6">
              {Object.entries(categoryStats).map(([key, stat]) => {
                if (stat.credits === 0) return null;
                const percent = totalCategoryCredits > 0 ? Math.round((stat.credits / totalCategoryCredits) * 100) : 0;
                const label = CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS];

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className="font-mono text-slate-600">
                        {stat.credits}학점 ({percent}%) · {stat.count}과목
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          key.includes('major') ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2">
              <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                전공 학점 비중이 <strong className="text-slate-900 font-semibold">{
                  totalCategoryCredits > 0
                    ? Math.round(((categoryStats.major_required.credits + categoryStats.major_elective.credits) / totalCategoryCredits) * 100)
                    : 0
                }%</strong>로 균형 있게 편성되어 있습니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task & Assignment Progress Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>과제 및 프로젝트 이행 현황</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-700">{completedAssignments} / {totalAssignments}건 완료</span>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${(completedAssignments / Math.max(1, totalAssignments)) * 100}%` }}
              title="완료됨"
            />
            <div
              className="bg-indigo-500 h-full transition-all"
              style={{ width: `${(inProgressAssignments / Math.max(1, totalAssignments)) * 100}%` }}
              title="진행 중"
            />
            <div
              className="bg-slate-300 h-full transition-all"
              style={{ width: `${(todoAssignments / Math.max(1, totalAssignments)) * 100}%` }}
              title="대기 중"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>완료: <strong className="text-slate-900 font-mono">{completedAssignments}건</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>진행 중: <strong className="text-slate-900 font-mono">{inProgressAssignments}건</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>대기 중: <strong className="text-slate-900 font-mono">{todoAssignments}건</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

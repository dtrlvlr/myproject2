import React, { useState } from 'react';
import { Course, Semester, StudentProfile, GradeScale, GradeValue, CATEGORY_LABELS, CourseCategory } from '../types';
import { calculateGpa, getCategoryStats } from '../utils';
import { Award, Target, Calculator, CheckCircle2, AlertCircle, ArrowUpRight, Plus, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

interface GpaCalculatorProps {
  courses: Course[];
  semesters: Semester[];
  currentSemesterId: string;
  profile: StudentProfile;
  onUpdateCourseGrade: (courseId: string, grade: GradeValue) => void;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onAddCourseToSemester?: (semesterId: string) => void;
}

export const GpaCalculator: React.FC<GpaCalculatorProps> = ({
  courses,
  semesters,
  currentSemesterId,
  profile,
  onUpdateCourseGrade,
  onUpdateProfile,
}) => {
  const [scale, setScale] = useState<GradeScale>(profile.gradeScale || 4.5);
  const [targetGradGpa, setTargetGradGpa] = useState<number>(profile.graduationTargetGpa || 4.0);
  const [targetGradCredits, setTargetGradCredits] = useState<number>(profile.graduationTargetCredits || 130);

  // Active semester courses
  const currentSemester = semesters.find((s) => s.id === currentSemesterId) || semesters[0];
  const currentCourses = courses.filter((c) => c.semesterId === currentSemesterId);

  // Overall stats across all semesters
  const overallStats = calculateGpa(courses, scale);

  // Current semester stats
  const currentSemesterStats = calculateGpa(currentCourses, scale);

  // Grade options based on scale
  const gradeOptions: { value: GradeValue; label: string }[] =
    scale === 4.5
      ? [
          { value: '', label: '미입력' },
          { value: 'A+', label: 'A+ (4.5)' },
          { value: 'A0', label: 'A0 (4.0)' },
          { value: 'B+', label: 'B+ (3.5)' },
          { value: 'B0', label: 'B0 (3.0)' },
          { value: 'C+', label: 'C+ (2.5)' },
          { value: 'C0', label: 'C0 (2.0)' },
          { value: 'D+', label: 'D+ (1.5)' },
          { value: 'D0', label: 'D0 (1.0)' },
          { value: 'F', label: 'F (0.0)' },
          { value: 'P', label: 'P (Pass)' },
          { value: 'NP', label: 'NP (Fail)' },
        ]
      : [
          { value: '', label: '미입력' },
          { value: 'A+', label: 'A+ (4.3)' },
          { value: 'A0', label: 'A0 (4.0)' },
          { value: 'A-', label: 'A- (3.7)' },
          { value: 'B+', label: 'B+ (3.3)' },
          { value: 'B0', label: 'B0 (3.0)' },
          { value: 'B-', label: 'B- (2.7)' },
          { value: 'C+', label: 'C+ (2.3)' },
          { value: 'C0', label: 'C0 (2.0)' },
          { value: 'C-', label: 'C- (1.7)' },
          { value: 'D+', label: 'D+ (1.3)' },
          { value: 'D0', label: 'D0 (1.0)' },
          { value: 'D-', label: 'D- (0.7)' },
          { value: 'F', label: 'F (0.0)' },
          { value: 'P', label: 'P (Pass)' },
          { value: 'NP', label: 'NP (Fail)' },
        ];

  // Graduation simulation calculations
  const remainingCredits = Math.max(0, targetGradCredits - overallStats.totalCreditsAcquired);
  // Formula: targetGradGpa * targetGradCredits = currentTotalPoints + remainingRequiredPoints
  // remainingRequiredGpa = (targetGradGpa * targetGradCredits - currentPoints) / remainingCredits
  const currentTotalPoints = overallStats.cumulativeGpa * overallStats.gpaCredits;
  const targetTotalPoints = targetGradGpa * (overallStats.gpaCredits + remainingCredits);
  const remainingRequiredGpa =
    remainingCredits > 0
      ? (targetTotalPoints - currentTotalPoints) / remainingCredits
      : overallStats.cumulativeGpa;

  const isSimulationFeasible = remainingRequiredGpa <= scale;
  const creditCompletionPercent = Math.min(
    100,
    Math.round((overallStats.totalCreditsAcquired / targetGradCredits) * 100)
  );

  const handleScaleToggle = (newScale: GradeScale) => {
    setScale(newScale);
    onUpdateProfile({ gradeScale: newScale });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Scale Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">학점 및 성적 관리</h2>
            <span className="text-xs text-slate-500 font-mono">
              ({profile.university} {profile.major})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            수강 과목별 성적을 입력하면 학기별 평점 및 누적 전공/총 평점이 실시간으로 산출됩니다.
          </p>
        </div>

        {/* 4.5 / 4.3 Scale Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">평점 기준:</span>
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => handleScaleToggle(4.5)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                scale === 4.5 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4.5 만점제
            </button>
            <button
              onClick={() => handleScaleToggle(4.3)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                scale === 4.3 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4.3 만점제
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Anti-slop: clean, unboxed text, high contrast tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative GPA */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">전체 누적 평점 (CGPA)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {overallStats.cumulativeGpa.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">/ {scale.toFixed(1)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>산출 학점</span>
            <span className="font-mono font-semibold text-slate-700">{overallStats.gpaCredits}학점</span>
          </div>
        </div>

        {/* Major GPA */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">전공 누적 평점 (Major GPA)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
              {overallStats.majorGpa.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">/ {scale.toFixed(1)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>전공 취득 학점</span>
            <span className="font-mono font-semibold text-indigo-700">{overallStats.majorCredits}학점</span>
          </div>
        </div>

        {/* Current Semester GPA */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">{currentSemester.name} 예상 평점</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {currentSemesterStats.cumulativeGpa > 0 ? currentSemesterStats.cumulativeGpa.toFixed(2) : '-'}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">/ {scale.toFixed(1)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>이번 학기 신청 학점</span>
            <span className="font-mono font-semibold text-slate-700">{currentSemesterStats.totalCreditsTaken}학점</span>
          </div>
        </div>

        {/* Total Credits Acquired / Target */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">졸업 학점 이수율</span>
            <span className="text-xs font-bold text-slate-700 font-mono">{creditCompletionPercent}%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {overallStats.totalCreditsAcquired}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">/ {targetGradCredits}학점</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${creditCompletionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Semester Course Grade Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentSemester.name} 성적 입력 및 관리</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              각 과목의 취득(예상) 학점을 선택하면 실시간으로 평점이 다시 계산됩니다.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              학기 신청: <strong className="text-slate-900 font-mono">{currentSemesterStats.totalCreditsTaken}학점</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              학기 평점: <strong className="text-indigo-600 font-mono">{currentSemesterStats.cumulativeGpa.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4">과목명</th>
                <th className="py-2.5 px-3">이수구분</th>
                <th className="py-2.5 px-3 text-right">학점</th>
                <th className="py-2.5 px-3">담당교수</th>
                <th className="py-2.5 px-4 text-right">취득 성적</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {currentCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {course.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {CATEGORY_LABELS[course.category]}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    {course.credits}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {course.professor || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={course.grade || ''}
                      onChange={(e) => onUpdateCourseGrade(course.id, e.target.value as GradeValue)}
                      className={`text-xs font-semibold rounded-md px-2.5 py-1.5 border focus:ring-2 focus:ring-indigo-500 ${
                        course.grade && course.grade.startsWith('A')
                          ? 'border-indigo-300 bg-indigo-50/50 text-indigo-900'
                          : course.grade && course.grade.startsWith('B')
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                          : course.grade === 'F'
                          ? 'border-rose-300 bg-rose-50 text-rose-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {gradeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {currentCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    이번 학기에 등록된 강의가 없습니다. '시간표' 탭에서 강의를 추가해보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graduation Target Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>졸업 목표 학점 시뮬레이터</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              졸업까지 남은 학점과 목표 평점을 입력하여 향후 달성해야 할 학점을 시뮬레이션합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              졸업 기준 학점 (총 요건)
            </label>
            <div className="relative">
              <input
                type="number"
                min="60"
                max="200"
                value={targetGradCredits}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTargetGradCredits(val);
                  onUpdateProfile({ graduationTargetCredits: val });
                }}
                className="w-full text-xs font-mono font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">학점</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              목표 졸업 평점 (Target CGPA)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="1.0"
                max={scale}
                value={targetGradGpa}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTargetGradGpa(val);
                  onUpdateProfile({ graduationTargetGpa: val });
                }}
                className="w-full text-xs font-mono font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">/ {scale.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              졸업까지 남은 취득 학점
            </label>
            <div className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
              {remainingCredits}학점 남음
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className={`p-4 rounded-xl border ${
          isSimulationFeasible
            ? 'bg-indigo-50/50 border-indigo-200'
            : 'bg-rose-50/50 border-rose-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-700">시뮬레이션 분석 결과</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                남은 <span className="font-mono text-indigo-600">{remainingCredits}학점</span> 동안 매 학기 평균{' '}
                <span className={`font-mono text-base ${isSimulationFeasible ? 'text-indigo-700 font-extrabold' : 'text-rose-600'}`}>
                  {remainingRequiredGpa.toFixed(2)}
                </span>
                점 이상을 취득해야 목표 평점({targetGradGpa.toFixed(2)})을 달성할 수 있습니다.
              </p>
            </div>

            <div className="shrink-0 text-xs font-medium">
              {isSimulationFeasible ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  달성 가능한 목표
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  목표 평점 조정 권장 (만점 초과)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-semester Performance History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">학기별 성적 이력</h3>
          <span className="text-xs text-slate-500 font-mono">총 {semesters.length}개 학기 기록</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4">학기</th>
                <th className="py-2.5 px-3 text-right">신청 학점</th>
                <th className="py-2.5 px-3 text-right">취득 학점</th>
                <th className="py-2.5 px-3 text-right">전공 학점</th>
                <th className="py-2.5 px-3 text-right">학기 평점</th>
                <th className="py-2.5 px-4 text-right">학기 전공 평점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {semesters.map((sem) => {
                const semCourses = courses.filter((c) => c.semesterId === sem.id);
                const stats = calculateGpa(semCourses, scale);

                return (
                  <tr key={sem.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sem.name} {sem.isCurrent ? <span className="text-[10px] text-indigo-600 font-normal ml-1">(현재)</span> : ''}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{stats.totalCreditsTaken}</td>
                    <td className="py-3 px-3 text-right font-mono">{stats.totalCreditsAcquired}</td>
                    <td className="py-3 px-3 text-right font-mono">{stats.majorCredits}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {stats.cumulativeGpa > 0 ? stats.cumulativeGpa.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                      {stats.majorGpa > 0 ? stats.majorGpa.toFixed(2) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, CheckSquare, GraduationCap, BarChart2, Plus, Download, RefreshCw, Sparkles, FileSpreadsheet } from 'lucide-react';
import { Semester } from '../types';

export type ActiveTab = 'timetable' | 'assignments' | 'grades' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  semesters: Semester[];
  currentSemesterId: string;
  onSemesterChange: (id: string) => void;
  onOpenNewCourse: () => void;
  onOpenNewAssignment: () => void;
  onOpenDataModal: () => void;
  onOpenWizard: () => void;
  onExportExcel: () => void;
  pendingAssignmentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  semesters,
  currentSemesterId,
  onSemesterChange,
  onOpenNewCourse,
  onOpenNewAssignment,
  onOpenDataModal,
  onOpenWizard,
  onExportExcel,
  pendingAssignmentCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element Brand mark */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={() => onTabChange('timetable')}>
              캠퍼스메이트
            </span>

            {/* Semester selector */}
            <div className="hidden sm:flex items-center">
              <select
                value={currentSemesterId}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                aria-label="학기 선택"
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} {sem.isCurrent ? '(현재 학기)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean text tabs) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('timetable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>시간표</span>
            </button>

            <button
              onClick={() => onTabChange('assignments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative ${
                activeTab === 'assignments'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>과제 & 시험</span>
              {pendingAssignmentCount > 0 && (
                <span className="ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-white leading-none">
                  {pendingAssignmentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('grades')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>학점 계산기</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>학습 분석</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              title="시간표 및 학업 기록 엑셀(.xlsx) 파일 다운로드"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>엑셀 저장</span>
            </button>

            <button
              onClick={onOpenWizard}
              title="초기 설정 마법사 실행"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>설정 마법사</span>
            </button>

            <button
              onClick={onOpenDataModal}
              title="데이터 백업 및 초기화"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="데이터 관리"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="relative group">
              <button
                onClick={onOpenNewCourse}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>강의 등록</span>
              </button>
            </div>

            <button
              onClick={onOpenNewAssignment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>과제 등록</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

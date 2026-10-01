/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Assignment, Semester, StudentProfile, DayOfWeek, GradeValue, TaskStatus } from './types';
import { INITIAL_COURSES, INITIAL_ASSIGNMENTS, INITIAL_SEMESTERS, INITIAL_PROFILE } from './data/initialData';
import { Navbar, ActiveTab } from './components/Navbar';
import { TodaySummary } from './components/TodaySummary';
import { Timetable } from './components/Timetable';
import { AssignmentTracker } from './components/AssignmentTracker';
import { GpaCalculator } from './components/GpaCalculator';
import { WeeklyAnalytics } from './components/WeeklyAnalytics';
import { CourseModal } from './components/CourseModal';
import { AssignmentModal } from './components/AssignmentModal';
import { CourseDetailDrawer } from './components/CourseDetailDrawer';
import { DataModal } from './components/DataModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Toast, ToastMessage } from './components/Toast';
import { exportToExcel } from './utils/excelExport';

export default function App() {
  // Check if onboarding completed previously
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('campusmate_onboarded');
  });

  // Persistence state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('campusmate_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('campusmate_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [currentSemesterId, setCurrentSemesterId] = useState<string>(() => {
    const saved = localStorage.getItem('campusmate_current_semester');
    return saved || 'sem-2026-1';
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('campusmate_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('campusmate_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('timetable');
  const [selectedCourseForDrawer, setSelectedCourseForDrawer] = useState<Course | null>(null);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [slotPrefill, setSlotPrefill] = useState<{ day: DayOfWeek; startTime: string } | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | undefined>(undefined);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('campusmate_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('campusmate_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('campusmate_current_semester', currentSemesterId);
  }, [currentSemesterId]);

  useEffect(() => {
    localStorage.setItem('campusmate_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('campusmate_assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Current semester courses & assignments
  const currentSemesterCourses = courses.filter((c) => c.semesterId === currentSemesterId);
  const currentSemesterAssignments = assignments.filter((a) => a.semesterId === currentSemesterId);
  const pendingAssignmentCount = currentSemesterAssignments.filter((a) => a.status !== 'done').length;

  // Course handlers
  const handleSaveCourse = (savedCourse: Course) => {
    const exists = courses.some((c) => c.id === savedCourse.id);
    if (exists) {
      setCourses(courses.map((c) => (c.id === savedCourse.id ? savedCourse : c)));
      showToast(`'${savedCourse.name}' 강의 정보가 수정되었습니다.`);
    } else {
      setCourses([...courses, savedCourse]);
      showToast(`'${savedCourse.name}' 강의가 성공적으로 등록되었습니다.`);
    }

    if (selectedCourseForDrawer && selectedCourseForDrawer.id === savedCourse.id) {
      setSelectedCourseForDrawer(savedCourse);
    }
    setEditingCourse(null);
    setSlotPrefill(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    setCourses(courses.filter((c) => c.id !== courseId));
    if (selectedCourseForDrawer && selectedCourseForDrawer.id === courseId) {
      setSelectedCourseForDrawer(null);
    }
    showToast(`'${target?.name || '강의'}'가 삭제되었습니다.`, 'info');
  };

  const handleUpdateCourseGrade = (courseId: string, grade: GradeValue) => {
    setCourses(
      courses.map((c) => (c.id === courseId ? { ...c, grade } : c))
    );
    showToast('성적이 반영되었습니다.');
  };

  // Assignment handlers
  const handleSaveAssignment = (savedAssignment: Assignment) => {
    const exists = assignments.some((a) => a.id === savedAssignment.id);
    if (exists) {
      setAssignments(assignments.map((a) => (a.id === savedAssignment.id ? savedAssignment : a)));
      showToast('과제 정보가 수정되었습니다.');
    } else {
      setAssignments([...assignments, savedAssignment]);
      showToast('새 과제가 등록되었습니다.');
    }
    setEditingAssignment(null);
    setPreselectedCourseId(undefined);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
    showToast('과제가 삭제되었습니다.', 'info');
  };

  const handleToggleAssignmentStatus = (id: string, newStatus: TaskStatus) => {
    setAssignments(
      assignments.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
          };
        }
        return a;
      })
    );
    if (newStatus === 'done') {
      showToast('과제를 완료했습니다! 🎉');
    }
  };

  // Quick triggers
  const handleOpenAddCourseAtSlot = (day: DayOfWeek, startTime: string) => {
    setEditingCourse(null);
    setSlotPrefill({ day, startTime });
    setIsCourseModalOpen(true);
  };

  const handleAddAssignmentForCourse = (courseId: string) => {
    setEditingAssignment(null);
    setPreselectedCourseId(courseId);
    setIsAssignmentModalOpen(true);
  };

  // Data Export & Import
  const handleExportData = () => {
    const data = {
      profile,
      semesters,
      currentSemesterId,
      courses,
      assignments,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `campusmate-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('데이터 백업 파일이 다운로드되었습니다.');
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.courses && parsed.assignments) {
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.semesters) setSemesters(parsed.semesters);
          if (parsed.currentSemesterId) setCurrentSemesterId(parsed.currentSemesterId);
          setCourses(parsed.courses);
          setAssignments(parsed.assignments);
          showToast('백업 데이터가 성공적으로 복원되었습니다.');
          setIsDataModalOpen(false);
        } else {
          showToast('올바르지 않은 백업 파일 형식입니다.', 'error');
        }
      } catch (e) {
        showToast('파일을 파싱하는 중 오류가 발생했습니다.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    setProfile(INITIAL_PROFILE);
    setSemesters(INITIAL_SEMESTERS);
    setCurrentSemesterId('sem-2026-1');
    setCourses(INITIAL_COURSES);
    setAssignments(INITIAL_ASSIGNMENTS);
    showToast('기본 예시 데이터로 초기화되었습니다.', 'info');
  };

  // Onboarding wizard handlers
  const handleCompleteOnboarding = (data: {
    profile: StudentProfile;
    semesterName: string;
    courses: Course[];
    assignments: Assignment[];
  }) => {
    setProfile(data.profile);

    const newSemId = `sem-${Date.now()}`;
    const newSem: Semester = {
      id: newSemId,
      name: data.semesterName || '2026학년도 1학기',
      year: 2026,
      term: '1학기',
      isCurrent: true,
      targetCredits: data.courses.reduce((acc, c) => acc + c.credits, 0),
      targetGpa: data.profile.graduationTargetGpa,
    };

    setSemesters([newSem]);
    setCurrentSemesterId(newSemId);

    // If user added courses, attach semester ID; if empty, use clean sample
    const finalCourses = data.courses.length > 0
      ? data.courses.map((c) => ({ ...c, semesterId: newSemId }))
      : INITIAL_COURSES.map((c) => ({ ...c, semesterId: newSemId }));

    const finalAssignments = data.assignments.map((a) => ({
      ...a,
      semesterId: newSemId,
    }));

    setCourses(finalCourses);
    setAssignments(finalAssignments);
    localStorage.setItem('campusmate_onboarded', 'true');
    setIsOnboardingOpen(false);
    showToast('환영합니다! 나만의 맞춤형 학업 환경이 생성되었습니다. 🎉');
  };

  const handleSkipToSample = () => {
    setProfile(INITIAL_PROFILE);
    setSemesters(INITIAL_SEMESTERS);
    setCurrentSemesterId('sem-2026-1');
    setCourses(INITIAL_COURSES);
    setAssignments(INITIAL_ASSIGNMENTS);
    localStorage.setItem('campusmate_onboarded', 'true');
    setIsOnboardingOpen(false);
    showToast('예시 시간표와 과제가 로드되었습니다. 자유롭게 수정하세요!');
  };

  // Excel (.xlsx) export handler
  const handleExportExcel = () => {
    const semName = semesters.find((s) => s.id === currentSemesterId)?.name || '2026학년도 1학기';
    exportToExcel({
      profile,
      semesterName: semName,
      courses: currentSemesterCourses,
      assignments: currentSemesterAssignments,
    });
    showToast('시간표와 학업 기록이 엑셀(.xlsx) 파일로 저장되었습니다. 📊');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        semesters={semesters}
        currentSemesterId={currentSemesterId}
        onSemesterChange={setCurrentSemesterId}
        onOpenNewCourse={() => {
          setEditingCourse(null);
          setSlotPrefill(null);
          setIsCourseModalOpen(true);
        }}
        onOpenNewAssignment={() => {
          setEditingAssignment(null);
          setPreselectedCourseId(undefined);
          setIsAssignmentModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenWizard={() => setIsOnboardingOpen(true)}
        onExportExcel={handleExportExcel}
        pendingAssignmentCount={pendingAssignmentCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Today Summary Banner Widget */}
        <TodaySummary
          courses={currentSemesterCourses}
          assignments={currentSemesterAssignments}
          onSelectCourse={(course) => setSelectedCourseForDrawer(course)}
          onNavigateToAssignments={() => setActiveTab('assignments')}
        />

        {/* Tab 1: Timetable */}
        {activeTab === 'timetable' && (
          <Timetable
            courses={currentSemesterCourses}
            onSelectCourse={(course) => setSelectedCourseForDrawer(course)}
            onAddCourseAtSlot={handleOpenAddCourseAtSlot}
            onEditCourse={(course) => {
              setEditingCourse(course);
              setIsCourseModalOpen(true);
            }}
            onExportExcel={handleExportExcel}
          />
        )}

        {/* Tab 2: Assignment Tracker */}
        {activeTab === 'assignments' && (
          <AssignmentTracker
            assignments={currentSemesterAssignments}
            courses={currentSemesterCourses}
            onAddAssignment={() => {
              setEditingAssignment(null);
              setPreselectedCourseId(undefined);
              setIsAssignmentModalOpen(true);
            }}
            onEditAssignment={(asg) => {
              setEditingAssignment(asg);
              setIsAssignmentModalOpen(true);
            }}
            onDeleteAssignment={handleDeleteAssignment}
            onToggleStatus={handleToggleAssignmentStatus}
          />
        )}

        {/* Tab 3: GPA & Credit Calculator */}
        {activeTab === 'grades' && (
          <GpaCalculator
            courses={courses}
            semesters={semesters}
            currentSemesterId={currentSemesterId}
            profile={profile}
            onUpdateCourseGrade={handleUpdateCourseGrade}
            onUpdateProfile={(updated) => setProfile({ ...profile, ...updated })}
          />
        )}

        {/* Tab 4: Weekly Analytics & Workload */}
        {activeTab === 'analytics' && (
          <WeeklyAnalytics
            courses={currentSemesterCourses}
            assignments={currentSemesterAssignments}
            profile={profile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">캠퍼스메이트 (CampusMate)</span>
            <span className="mx-2">·</span>
            <span>대학생 올인원 학업·시간표·학점 관리 플랫폼</span>
          </div>

          <div className="flex items-center gap-4">
            <span>로컬 스토리지 자동 저장</span>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="text-indigo-600 hover:underline"
            >
              데이터 백업 및 설정
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
          setSlotPrefill(null);
        }}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
        initialCourse={editingCourse}
        semesterId={currentSemesterId}
        prefillDay={slotPrefill?.day}
        prefillStartTime={slotPrefill?.startTime}
      />

      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
          setPreselectedCourseId(undefined);
        }}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteAssignment}
        initialAssignment={editingAssignment}
        courses={currentSemesterCourses}
        semesterId={currentSemesterId}
        preselectedCourseId={preselectedCourseId}
      />

      <CourseDetailDrawer
        course={selectedCourseForDrawer}
        assignments={assignments}
        onClose={() => setSelectedCourseForDrawer(null)}
        onEdit={(course) => {
          setEditingCourse(course);
          setIsCourseModalOpen(true);
        }}
        onDelete={handleDeleteCourse}
        onAddAssignmentForCourse={(courseId) => handleAddAssignmentForCourse(courseId)}
        onToggleAssignmentStatus={(id, newStatus) => handleToggleAssignmentStatus(id, newStatus)}
      />

      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onExportExcel={handleExportExcel}
      />

      {/* Onboarding Wizard (Initial human input flow) */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onSkipToSample={handleSkipToSample}
      />

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

import React, { useState } from 'react';
import { StudentProfile, Course, Assignment, Semester, CourseCategory, DayOfWeek, GradeScale, CATEGORY_LABELS, DAY_SHORT_KO, COURSE_COLOR_PALETTES } from '../types';
import { INITIAL_COURSES, INITIAL_ASSIGNMENTS, INITIAL_PROFILE } from '../data/initialData';
import { exportToExcel } from '../utils/excelExport';
import { BookOpen, Calendar, CheckSquare, GraduationCap, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, Sparkles, Clock, MapPin, User, FileSpreadsheet } from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (data: {
    profile: StudentProfile;
    semesterName: string;
    courses: Course[];
    assignments: Assignment[];
  }) => void;
  onSkipToSample: () => void;
}

const KOREAN_PERIOD_PRESETS = [
  { name: '1교시 (09:00~10:15)', start: '09:00', end: '10:15' },
  { name: '2교시 (10:30~11:45)', start: '10:30', end: '11:45' },
  { name: '3교시 (12:00~13:15)', start: '12:00', end: '13:15' },
  { name: '4교시 (13:30~14:45)', start: '13:30', end: '14:45' },
  { name: '5교시 (15:00~16:15)', start: '15:00', end: '16:15' },
  { name: '6교시 (16:30~17:45)', start: '16:30', end: '17:45' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onComplete,
  onSkipToSample,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1 State: Profile & Target
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    university: '',
    major: '',
    studentId: '',
    currentGrade: 1,
    graduationTargetCredits: 130,
    graduationTargetGpa: 4.0,
    gradeScale: 4.5,
  });
  const [semesterName, setSemesterName] = useState<string>('2026학년도 1학기');

  // Step 2 State: Initial Courses
  const [courses, setCourses] = useState<Course[]>([]);
  // Quick course input form
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseProf, setNewCourseProf] = useState('');
  const [newCourseRoom, setNewCourseRoom] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState<number>(3);
  const [newCourseCategory, setNewCourseCategory] = useState<CourseCategory>('major_required');
  const [newCourseDay, setNewCourseDay] = useState<DayOfWeek>('mon');
  const [newCourseStart, setNewCourseStart] = useState('09:00');
  const [newCourseEnd, setNewCourseEnd] = useState('10:15');

  // Step 3 State: Initial Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgCourseId, setNewAsgCourseId] = useState('');
  const [newAsgDueDate, setNewAsgDueDate] = useState('');

  // Excel auto-download option
  const [autoDownloadExcel, setAutoDownloadExcel] = useState<boolean>(true);

  if (!isOpen) return null;

  // Add course to wizard list
  const handleAddCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCourseName.trim()) return;

    const palId = COURSE_COLOR_PALETTES[courses.length % COURSE_COLOR_PALETTES.length].id;
    const courseId = `course-init-${Date.now()}-${Math.random()}`;

    const newCourse: Course = {
      id: courseId,
      semesterId: 'sem-current',
      name: newCourseName.trim(),
      professor: newCourseProf.trim() || '담당교수 미정',
      room: newCourseRoom.trim() || '강의실 미정',
      credits: newCourseCredits,
      category: newCourseCategory,
      colorId: palId,
      slots: [
        {
          id: `slot-${Date.now()}`,
          day: newCourseDay,
          startTime: newCourseStart,
          endTime: newCourseEnd,
        },
      ],
    };

    setCourses([...courses, newCourse]);
    setNewCourseName('');
    setNewCourseProf('');
    setNewCourseRoom('');
  };

  const handleRemoveCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
    setAssignments(assignments.filter((a) => a.courseId !== courseId));
  };

  // Pre-load Computer Science sample courses
  const handleLoadSampleCourses = () => {
    setCourses(INITIAL_COURSES.filter((c) => c.semesterId === 'sem-2026-1'));
    if (!profile.major) {
      setProfile((prev) => ({
        ...prev,
        university: '한국대학교',
        major: '컴퓨터소프트웨어학부',
        name: prev.name || '홍길동',
      }));
    }
  };

  // Add assignment to wizard list
  const handleAddAssignment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgDueDate) return;

    const newAsg: Assignment = {
      id: `asg-init-${Date.now()}`,
      semesterId: 'sem-current',
      courseId: newAsgCourseId || (courses.length > 0 ? courses[0].id : ''),
      title: newAsgTitle.trim(),
      type: 'assignment',
      dueDate: newAsgDueDate,
      priority: 'high',
      status: 'in_progress',
    };

    setAssignments([...assignments, newAsg]);
    setNewAsgTitle('');
    setNewAsgDueDate('');
  };

  const handleRemoveAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const handleFinish = () => {
    // Fallback profile values if empty
    const finalProfile: StudentProfile = {
      ...profile,
      name: profile.name.trim() || '대학생',
      university: profile.university.trim() || '한국대학교',
      major: profile.major.trim() || '자유전공학부',
      studentId: profile.studentId.trim() || '20260001',
    };

    if (autoDownloadExcel) {
      exportToExcel({
        profile: finalProfile,
        semesterName,
        courses,
        assignments,
      });
    }

    onComplete({
      profile: finalProfile,
      semesterName,
      courses,
      assignments,
    });
  };

  const totalRegisteredCredits = courses.reduce((acc, c) => acc + c.credits, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Wizard Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-indigo-400">
              초기 설정 마법사
            </span>
            <button
              onClick={onSkipToSample}
              className="text-xs text-slate-300 hover:text-white underline transition-colors"
            >
              예시 데이터로 바로 시작하기
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            캠퍼스메이트 학업 플래너 시작하기
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            내 학적 정보와 이번 학기 시간표, 과제를 직접 입력하고 맞춤형 대시보드를 생성하세요.
          </p>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { num: 1, label: '학적 및 기준' },
              { num: 2, label: '시간표 등록' },
              { num: 3, label: '과제 등록' },
              { num: 4, label: '최종 확인' },
            ].map((s) => (
              <div
                key={s.num}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : step > s.num
                    ? 'bg-slate-800 text-indigo-300 font-medium'
                    : 'bg-slate-800/60 text-slate-400 font-medium'
                }`}
              >
                <div className="text-[11px] font-mono leading-none">0{s.num}</div>
                <div className="text-xs truncate mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Body by Step */}
        <div className="p-6 sm:p-7 flex-1 overflow-y-auto max-h-[60vh]">
          {/* STEP 1: Profile & Targets */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>학적 정보 및 학점 기준 입력</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  재학 중인 대학교와 학과, 평점 만점 기준을 설정해 주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    대학교명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 서울대학교, 한국대학교"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    학과 / 학부 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 컴퓨터공학부, 경영학과"
                    value={profile.major}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    학생 이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    학번 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 20261234"
                    value={profile.studentId}
                    onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    현재 학년
                  </label>
                  <select
                    value={profile.currentGrade}
                    onChange={(e) => setProfile({ ...profile, currentGrade: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                    <option value={4}>4학년 이상</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  학교 평점 만점 기준
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gradeScale: 4.5 })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.gradeScale === 4.5
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">4.5 만점제</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      A+(4.5), A0(4.0), B+(3.5)... 대부분의 국내 대학교
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gradeScale: 4.3 })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profile.gradeScale === 4.3
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">4.3 만점제</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      A+(4.3), A0(4.0), A-(3.7)... 서울대, 연세대, 서강대 등
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    졸업 총 필요 학점
                  </label>
                  <input
                    type="number"
                    value={profile.graduationTargetCredits}
                    onChange={(e) => setProfile({ ...profile, graduationTargetCredits: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    목표 졸업 평점 (Target GPA)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    max={profile.gradeScale}
                    value={profile.graduationTargetGpa}
                    onChange={(e) => setProfile({ ...profile, graduationTargetGpa: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Timetable / Courses */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>이번 학기 시간표 과목 입력</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    수강 신청한 과목들을 등록해 주세요. (현재 <strong className="text-indigo-600">{courses.length}</strong>과목, <strong className="text-slate-900 font-mono">{totalRegisteredCredits}</strong>학점)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleCourses}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>예시 시간표 불러오기</span>
                </button>
              </div>

              {/* Course Input Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  + 과목 직접 추가
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="과목명 (예: 운영체제, 일반물리학)"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <select
                      value={newCourseCategory}
                      onChange={(e) => setNewCourseCategory(e.target.value as CourseCategory)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="담당교수"
                    value={newCourseProf}
                    onChange={(e) => setNewCourseProf(e.target.value)}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="강의실 (예: IT관 201호)"
                    value={newCourseRoom}
                    onChange={(e) => setNewCourseRoom(e.target.value)}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  />
                  <select
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(Number(e.target.value))}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                  >
                    <option value={1}>1학점</option>
                    <option value={2}>2학점</option>
                    <option value={3}>3학점</option>
                    <option value={4}>4학점</option>
                    <option value={5}>5학점</option>
                  </select>
                </div>

                {/* Day & Time Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newCourseDay}
                    onChange={(e) => setNewCourseDay(e.target.value as DayOfWeek)}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayOfWeek[]).map((d) => (
                      <option key={d} value={d}>
                        {DAY_SHORT_KO[d]}요일
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={newCourseStart}
                    onChange={(e) => setNewCourseStart(e.target.value)}
                    className="text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  />

                  <input
                    type="time"
                    value={newCourseEnd}
                    onChange={(e) => setNewCourseEnd(e.target.value)}
                    className="text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                {/* Quick Period Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 mr-1">교시 프리셋:</span>
                  {KOREAN_PERIOD_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setNewCourseStart(p.start);
                        setNewCourseEnd(p.end);
                      }}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded text-slate-600 transition-colors"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddCourse()}
                    disabled={!newCourseName.trim()}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>강의 추가</span>
                  </button>
                </div>
              </div>

              {/* Registered Courses List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  등록된 강의 목록 ({courses.length}개)
                </span>

                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{c.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {CATEGORY_LABELS[c.category]} · {c.credits}학점
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{c.professor}</span>
                        <span>·</span>
                        <span>{c.room}</span>
                        <span>·</span>
                        <span className="font-mono text-indigo-600">
                          {c.slots.map((s) => `${DAY_SHORT_KO[s.day]} ${s.startTime}~${s.endTime}`).join(', ')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {courses.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-6 border border-dashed border-slate-200 rounded-lg">
                    아직 등록된 과목이 없습니다. 위 폼에서 과목을 추가하거나 '예시 시간표 불러오기'를 클릭하세요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Initial Assignments & Deadlines */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>마감 과제 및 시험 일정 등록 (선택)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  이번 학기에 제출해야 할 과제나 시험 일정이 있다면 등록해 보세요. (추후 언제든 추가 가능)
                </p>
              </div>

              {/* Assignment Input Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  + 새 과제 추가
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newAsgCourseId}
                    onChange={(e) => setNewAsgCourseId(e.target.value)}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="">일반 학업 / 기타</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="datetime-local"
                    value={newAsgDueDate}
                    onChange={(e) => setNewAsgDueDate(e.target.value)}
                    className="text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="과제명 / 시험 내용 (예: 알고리즘 1차 과제, 중간고사 대비)"
                    value={newAsgTitle}
                    onChange={(e) => setNewAsgTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddAssignment()}
                    disabled={!newAsgTitle.trim() || !newAsgDueDate}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>과제 추가</span>
                  </button>
                </div>
              </div>

              {/* Registered Assignments List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  등록된 과제 및 시험 ({assignments.length}개)
                </span>

                {assignments.map((a) => {
                  const course = courses.find((c) => c.id === a.courseId);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{a.title}</span>
                          <span className="text-[11px] text-indigo-600">
                            {course?.name || '일반'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          마감: {a.dueDate.replace('T', ' ')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {assignments.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-6 border border-dashed border-slate-200 rounded-lg">
                    아직 등록된 과제가 없습니다. 지금 추가하거나 다음 단계로 넘어가실 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Launch */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>설정 완료 및 대시보드 생성 확인</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  입력하신 내용을 바탕으로 맞춤형 학업 대시보드를 생성합니다.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-semibold text-slate-600">학생 정보</span>
                  <span className="text-xs font-bold text-slate-900">
                    {profile.university || '한국대학교'} {profile.major || '자유전공'} {profile.name || '학생'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-semibold text-slate-600">평점 기준</span>
                  <span className="text-xs font-bold font-mono text-indigo-700">
                    {profile.gradeScale} 만점제 (목표: {profile.graduationTargetGpa} / 졸업 {profile.graduationTargetCredits}학점)
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-semibold text-slate-600">이번 학기 수강 과목</span>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    총 {courses.length}개 과목 ({totalRegisteredCredits}학점)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">등록된 과제/시험</span>
                  <span className="text-xs font-bold font-mono text-rose-600">
                    {assignments.length}건
                  </span>
                </div>
              </div>

              {/* Excel Export Option Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        엑셀(.xlsx) 파일 저장 지원
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        지금 입력한 시간표, 수강 과목 목록, 과제 마감 현황이 멀티 시트 엑셀 파일로 함께 저장됩니다.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const finalProfile: StudentProfile = {
                        ...profile,
                        name: profile.name.trim() || '대학생',
                        university: profile.university.trim() || '한국대학교',
                        major: profile.major.trim() || '자유전공학부',
                        studentId: profile.studentId.trim() || '20260001',
                      };
                      exportToExcel({
                        profile: finalProfile,
                        semesterName,
                        courses,
                        assignments,
                      });
                    }}
                    className="shrink-0 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                  >
                    지금 엑셀 다운로드
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-emerald-200/60 select-none">
                  <input
                    type="checkbox"
                    checked={autoDownloadExcel}
                    onChange={(e) => setAutoDownloadExcel(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-emerald-900">
                    '캠퍼스메이트 시작하기' 완료 시 엑셀 파일(.xlsx) 자동 다운로드
                  </span>
                </label>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                모든 입력 정보는 브라우저 로컬 저장소에 안전하게 유지되며, 시간표와 학점 계산기에서 언제든지 자유롭게 수정 및 엑셀 다운로드가 가능합니다.
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>이전 단계</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSkipToSample}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              샘플 데이터로 건너뛰기
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <span>다음 단계</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>캠퍼스메이트 시작하기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

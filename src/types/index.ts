export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const DAY_NAMES_KO: Record<DayOfWeek, string> = {
  mon: '월요일',
  tue: '화요일',
  wed: '수요일',
  thu: '목요일',
  fri: '금요일',
  sat: '토요일',
};

export const DAY_SHORT_KO: Record<DayOfWeek, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
};

export type CourseCategory =
  | 'major_required' // 전공필수
  | 'major_elective' // 전공선택
  | 'general_required' // 교양필수
  | 'general_elective' // 교양선택
  | 'general_other'; // 일반선택/기타

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  major_required: '전공필수',
  major_elective: '전공선택',
  general_required: '교양필수',
  general_elective: '교양선택',
  general_other: '일반선택',
};

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // '09:00'
  endTime: string; // '10:30'
  room?: string;
}

export interface CourseColor {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  lightBg: string;
  accent: string;
}

export const COURSE_COLOR_PALETTES: CourseColor[] = [
  {
    id: 'indigo',
    name: '인디고',
    bg: 'bg-indigo-600',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    lightBg: 'bg-indigo-50/90',
    accent: '#4f46e5',
  },
  {
    id: 'sky',
    name: '스카이블루',
    bg: 'bg-sky-600',
    text: 'text-sky-900',
    border: 'border-sky-200',
    lightBg: 'bg-sky-50/90',
    accent: '#0284c7',
  },
  {
    id: 'emerald',
    name: '에메랄드',
    bg: 'bg-emerald-600',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    lightBg: 'bg-emerald-50/90',
    accent: '#059669',
  },
  {
    id: 'amber',
    name: '앰버 오렌지',
    bg: 'bg-amber-600',
    text: 'text-amber-900',
    border: 'border-amber-200',
    lightBg: 'bg-amber-50/90',
    accent: '#d97706',
  },
  {
    id: 'rose',
    name: '로즈 핑크',
    bg: 'bg-rose-600',
    text: 'text-rose-900',
    border: 'border-rose-200',
    lightBg: 'bg-rose-50/90',
    accent: '#e11d48',
  },
  {
    id: 'purple',
    name: '퍼플 바이올렛',
    bg: 'bg-purple-600',
    text: 'text-purple-900',
    border: 'border-purple-200',
    lightBg: 'bg-purple-50/90',
    accent: '#9333ea',
  },
  {
    id: 'teal',
    name: '민트 틸',
    bg: 'bg-teal-600',
    text: 'text-teal-900',
    border: 'border-teal-200',
    lightBg: 'bg-teal-50/90',
    accent: '#0d9488',
  },
  {
    id: 'slate',
    name: '슬레이트 그레이',
    bg: 'bg-slate-600',
    text: 'text-slate-900',
    border: 'border-slate-200',
    lightBg: 'bg-slate-100/90',
    accent: '#475569',
  },
];

export type GradeScale = 4.5 | 4.3;

export type GradeValue =
  | 'A+'
  | 'A0'
  | 'A-'
  | 'B+'
  | 'B0'
  | 'B-'
  | 'C+'
  | 'C0'
  | 'C-'
  | 'D+'
  | 'D0'
  | 'D-'
  | 'F'
  | 'P'
  | 'NP'
  | '';

export const GRADE_POINTS_45: Record<string, number> = {
  'A+': 4.5,
  'A0': 4.0,
  'B+': 3.5,
  'B0': 3.0,
  'C+': 2.5,
  'C0': 2.0,
  'D+': 1.5,
  'D0': 1.0,
  'F': 0.0,
};

export const GRADE_POINTS_43: Record<string, number> = {
  'A+': 4.3,
  'A0': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B0': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C0': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D0': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

export interface Course {
  id: string;
  semesterId: string;
  name: string;
  professor: string;
  room: string;
  credits: number;
  category: CourseCategory;
  colorId: string;
  slots: TimeSlot[];
  memo?: string;
  grade?: GradeValue;
  isRetake?: boolean;
}

export type AssignmentType =
  | 'assignment' // 일반과제
  | 'team_project' // 팀프로젝트
  | 'midterm' // 중간고사
  | 'final' // 기말고사
  | 'quiz' // 퀴즈/쪽지시험
  | 'presentation'; // 발표

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  assignment: '개인 과제',
  team_project: '팀 프로젝트',
  midterm: '중간고사',
  final: '기말고사',
  quiz: '퀴즈',
  presentation: '발표 준비',
};

export type Priority = 'high' | 'medium' | 'low';

export const PRIORITY_LABELS: Record<Priority, { label: string; color: string }> = {
  high: { label: '긴급', color: 'text-red-700 bg-red-50 border-red-200' },
  medium: { label: '보통', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low: { label: '여유', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '대기 중',
  in_progress: '진행 중',
  done: '완료됨',
};

export interface Assignment {
  id: string;
  courseId: string;
  semesterId: string;
  title: string;
  type: AssignmentType;
  dueDate: string; // YYYY-MM-DDTHH:mm
  priority: Priority;
  status: TaskStatus;
  description?: string;
  linkUrl?: string;
  completedAt?: string;
}

export interface Semester {
  id: string;
  name: string; // "2026-1학기"
  year: number;
  term: string; // "1학기" | "2학기" | "여름학기" | "겨울학기"
  isCurrent: boolean;
  targetCredits?: number;
  targetGpa?: number;
}

export interface StudentProfile {
  name: string;
  university: string;
  major: string;
  studentId: string;
  currentGrade: number; // 1, 2, 3, 4학년
  graduationTargetCredits: number; // e.g. 130
  graduationTargetGpa: number; // e.g. 4.0
  gradeScale: GradeScale; // 4.5 or 4.3
}

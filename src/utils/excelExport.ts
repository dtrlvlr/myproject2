import * as XLSX from 'xlsx';
import { Course, Assignment, StudentProfile, Semester, CATEGORY_LABELS, DAY_SHORT_KO, ASSIGNMENT_TYPE_LABELS, TASK_STATUS_LABELS, PRIORITY_LABELS, DayOfWeek } from '../types';
import { calculateGpa, timeToMinutes } from './index';

export interface ExportExcelParams {
  profile: StudentProfile;
  semesterName: string;
  courses: Course[];
  assignments: Assignment[];
}

export const exportToExcel = ({
  profile,
  semesterName,
  courses,
  assignments,
}: ExportExcelParams): void => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: 주간 시간표 그리드 (Weekly Timetable Grid)
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const dayHeaders = ['시간', '월요일', '화요일', '수요일', '목요일', '금요일'];
  const timetableRows: any[][] = [
    [`[${semesterName}] 주간 강의 시간표`],
    [`학생명: ${profile.name || '학생'} (${profile.university || '대학교'} ${profile.major || '전공'})`],
    [],
    dayHeaders,
  ];

  // Generate hourly blocks from 09:00 to 18:00
  for (let hour = 9; hour <= 18; hour++) {
    const timeLabel = `${String(hour).padStart(2, '0')}:00 ~ ${String(hour + 1).padStart(2, '0')}:00`;
    const row = [timeLabel];

    days.forEach((day) => {
      // Find courses on this day during this hour
      const matching = courses.filter((c) =>
        c.slots.some((s) => {
          if (s.day !== day) return false;
          const sMin = timeToMinutes(s.startTime);
          const eMin = timeToMinutes(s.endTime);
          const hStartMin = hour * 60;
          const hEndMin = (hour + 1) * 60;
          return Math.max(sMin, hStartMin) < Math.min(eMin, hEndMin);
        })
      );

      if (matching.length > 0) {
        const text = matching
          .map((c) => {
            const slot = c.slots.find((s) => s.day === day);
            return `${c.name}\n(${slot?.room || c.room || ''} / ${c.professor || ''})`;
          })
          .join('\n\n');
        row.push(text);
      } else {
        row.push('');
      }
    });

    timetableRows.push(row);
  }

  const wsTimetable = XLSX.utils.aoa_to_sheet(timetableRows);
  // Column widths
  wsTimetable['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTimetable, '주간시간표');

  // 2. Sheet 2: 수강 과목 및 성적 목록 (Course & Grade List)
  const courseHeaders = [
    '과목명',
    '이수구분',
    '학점',
    '담당교수',
    '강의실',
    '강의 시간',
    '취득 성적',
    '수업 메모/공지',
  ];

  const courseRows: any[][] = [
    [`[${semesterName}] 수강 신청 과목 및 성적 대장`],
    [],
    courseHeaders,
  ];

  courses.forEach((c) => {
    const timesStr = c.slots
      .map((s) => `${DAY_SHORT_KO[s.day]} ${s.startTime}~${s.endTime}`)
      .join(', ');

    courseRows.push([
      c.name,
      CATEGORY_LABELS[c.category] || c.category,
      c.credits,
      c.professor || '',
      c.room || '',
      timesStr,
      c.grade || '미입력',
      c.memo || '',
    ]);
  });

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  courseRows.push([]);
  courseRows.push(['총 이수 학점 합계', '', totalCredits, '', '', '', '', '']);

  const wsCourses = XLSX.utils.aoa_to_sheet(courseRows);
  wsCourses['!cols'] = [
    { wch: 24 },
    { wch: 12 },
    { wch: 8 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCourses, '수강과목_및_성적');

  // 3. Sheet 3: 과제 및 시험 마감 일정 (Assignments & Deadlines)
  const asgHeaders = [
    '과제/시험명',
    '해당 과목',
    '구분',
    '마감 일시',
    '중요도',
    '진행 상태',
    '상세 요구사항',
    '제출 링크',
  ];

  const asgRows: any[][] = [
    [`[${semesterName}] 과제 및 시험 마감 현황`],
    [],
    asgHeaders,
  ];

  assignments.forEach((a) => {
    const course = courses.find((c) => c.id === a.courseId);
    asgRows.push([
      a.title,
      course?.name || '일반 학업',
      ASSIGNMENT_TYPE_LABELS[a.type] || a.type,
      a.dueDate ? a.dueDate.replace('T', ' ') : '',
      PRIORITY_LABELS[a.priority]?.label || a.priority,
      TASK_STATUS_LABELS[a.status] || a.status,
      a.description || '',
      a.linkUrl || '',
    ]);
  });

  const wsAssignments = XLSX.utils.aoa_to_sheet(asgRows);
  wsAssignments['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 40 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAssignments, '과제_및_시험일정');

  // 4. Sheet 4: 학적 및 누적 평점 요약 (Academic Summary)
  const stats = calculateGpa(courses, profile.gradeScale);
  const summaryRows: any[][] = [
    ['캠퍼스메이트 학적 및 학점 관리 요약표'],
    [],
    ['항목', '내용'],
    ['학생 성명', profile.name || '-'],
    ['소속 대학교', profile.university || '-'],
    ['학과 / 학부', profile.major || '-'],
    ['학번', profile.studentId || '-'],
    ['현재 학년', `${profile.currentGrade || 1}학년`],
    ['평점 만점 기준', `${profile.gradeScale} 만점제`],
    ['누적 평점 (CGPA)', `${stats.cumulativeGpa.toFixed(2)} / ${profile.gradeScale.toFixed(1)}`],
    ['전공 누적 평점 (Major GPA)', `${stats.majorGpa.toFixed(2)} / ${profile.gradeScale.toFixed(1)}`],
    ['이번 학기 신청 학점', `${stats.totalCreditsTaken}학점`],
    ['총 취득 학점', `${stats.totalCreditsAcquired}학점`],
    ['전공 이수 학점', `${stats.majorCredits}학점`],
    ['교양 이수 학점', `${stats.generalCredits}학점`],
    ['졸업 요건 학점', `${profile.graduationTargetCredits || 130}학점`],
    ['목표 졸업 평점', `${profile.graduationTargetGpa || 4.0}점`],
    [],
    ['생성 일시', new Date().toLocaleString('ko-KR')],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, '학적_및_평점요약');

  // Generate filename with date and student name
  const safeName = (profile.name || '학생').replace(/[^a-zA-Z0-9가-힣]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `캠퍼스메이트_${safeName}_시간표및학업기록_${dateStr}.xlsx`;

  // Write and trigger browser download
  XLSX.writeFile(wb, fileName);
};

import { Course, CourseCategory, GradeScale, GradeValue, GRADE_POINTS_43, GRADE_POINTS_45, TimeSlot } from '../types';

// Convert '09:30' to 570 minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Convert minutes to '09:30'
export const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Detect if two slots overlap
export const doSlotsOverlap = (slotA: TimeSlot, slotB: TimeSlot): boolean => {
  if (slotA.day !== slotB.day) return false;
  if (slotA.id === slotB.id) return false;
  const startA = timeToMinutes(slotA.startTime);
  const endA = timeToMinutes(slotA.endTime);
  const startB = timeToMinutes(slotB.startTime);
  const endB = timeToMinutes(slotB.endTime);
  return Math.max(startA, startB) < Math.min(endA, endB);
};

// Check for all conflicts in a course list
export const findScheduleConflicts = (courses: Course[]): { slot1: TimeSlot; course1: Course; slot2: TimeSlot; course2: Course }[] => {
  const conflicts: { slot1: TimeSlot; course1: Course; slot2: TimeSlot; course2: Course }[] = [];
  const allSlots: { slot: TimeSlot; course: Course }[] = [];

  courses.forEach(course => {
    course.slots.forEach(slot => {
      allSlots.push({ slot, course });
    });
  });

  for (let i = 0; i < allSlots.length; i++) {
    for (let j = i + 1; j < allSlots.length; j++) {
      const a = allSlots[i];
      const b = allSlots[j];
      if (a.course.id !== b.course.id && doSlotsOverlap(a.slot, b.slot)) {
        conflicts.push({ slot1: a.slot, course1: a.course, slot2: b.slot, course2: b.course });
      }
    }
  }

  return conflicts;
};

// Calculate free periods (공강) on a given day in minutes
export const calculateFreePeriods = (courses: Course[], day: string): { freeMinutes: number; gaps: { start: string; end: string; duration: number }[] } => {
  const daySlots: { start: number; end: number }[] = [];

  courses.forEach(c => {
    c.slots.forEach(s => {
      if (s.day === day) {
        daySlots.push({
          start: timeToMinutes(s.startTime),
          end: timeToMinutes(s.endTime),
        });
      }
    });
  });

  if (daySlots.length <= 1) {
    return { freeMinutes: 0, gaps: [] };
  }

  daySlots.sort((a, b) => a.start - b.start);

  const gaps: { start: string; end: string; duration: number }[] = [];
  let freeMinutes = 0;

  for (let i = 0; i < daySlots.length - 1; i++) {
    const currentEnd = daySlots[i].end;
    const nextStart = daySlots[i + 1].start;
    if (nextStart > currentEnd) {
      const diff = nextStart - currentEnd;
      if (diff >= 30) { // count gaps 30 min or more as free periods
        gaps.push({
          start: minutesToTime(currentEnd),
          end: minutesToTime(nextStart),
          duration: diff,
        });
        freeMinutes += diff;
      }
    }
  }

  return { freeMinutes, gaps };
};

// D-Day calculation and text format
export const getDDayInfo = (dueDateStr: string): { diffDays: number; text: string; isPast: boolean; isToday: boolean; colorClass: string } => {
  const now = new Date();
  const due = new Date(dueDateStr);

  // Strip time for clean date difference
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffDays = Math.round((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      diffDays,
      text: 'D-Day 오늘 마감',
      isPast: false,
      isToday: true,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  } else if (diffDays > 0) {
    return {
      diffDays,
      text: `D-${diffDays}`,
      isPast: false,
      isToday: false,
      colorClass: diffDays <= 2 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-100 border-slate-200',
    };
  } else {
    return {
      diffDays,
      text: `D+${Math.abs(diffDays)} 마감 지남`,
      isPast: true,
      isToday: false,
      colorClass: 'text-neutral-500 bg-neutral-100 border-neutral-200',
    };
  }
};

// Format Korean date string (e.g. "10월 3일(목) 23:59")
export const formatKoreanDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const day = dayNames[d.getDay()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}월 ${date}일(${day}) ${hours}:${minutes}`;
};

// Calculate GPA metrics
export interface GpaStats {
  totalCreditsTaken: number; // 총 신청 학점
  totalCreditsAcquired: number; // P 포함 총 취득 학점
  gpaCredits: number; // GPA 산출에 포함된 학점 (P/NP 제외, F 포함)
  cumulativeGpa: number; // 총 평점
  majorGpa: number; // 전공 평점
  majorCredits: number;
  generalCredits: number;
  otherCredits: number;
}

export const calculateGpa = (courses: Course[], scale: GradeScale = 4.5): GpaStats => {
  let totalCreditsTaken = 0;
  let totalCreditsAcquired = 0;
  let gpaCredits = 0;
  let totalPoints = 0;

  let majorGpaCredits = 0;
  let majorTotalPoints = 0;
  let majorCredits = 0;

  let generalCredits = 0;
  let otherCredits = 0;

  const pointsMap = scale === 4.5 ? GRADE_POINTS_45 : GRADE_POINTS_43;

  courses.forEach(c => {
    if (!c.grade) return;

    totalCreditsTaken += c.credits;

    const isMajor = c.category === 'major_required' || c.category === 'major_elective';
    const isGeneral = c.category === 'general_required' || c.category === 'general_elective';

    if (c.grade === 'P') {
      totalCreditsAcquired += c.credits;
      if (isMajor) majorCredits += c.credits;
      else if (isGeneral) generalCredits += c.credits;
      else otherCredits += c.credits;
      return;
    }

    if (c.grade === 'NP') {
      return;
    }

    // Graded A+ ~ F
    const point = pointsMap[c.grade];
    if (point !== undefined) {
      gpaCredits += c.credits;
      totalPoints += point * c.credits;

      if (c.grade !== 'F') {
        totalCreditsAcquired += c.credits;
        if (isMajor) majorCredits += c.credits;
        else if (isGeneral) generalCredits += c.credits;
        else otherCredits += c.credits;
      }

      if (isMajor) {
        majorGpaCredits += c.credits;
        majorTotalPoints += point * c.credits;
      }
    }
  });

  const cumulativeGpa = gpaCredits > 0 ? Number((totalPoints / gpaCredits).toFixed(2)) : 0;
  const majorGpa = majorGpaCredits > 0 ? Number((majorTotalPoints / majorGpaCredits).toFixed(2)) : 0;

  return {
    totalCreditsTaken,
    totalCreditsAcquired,
    gpaCredits,
    cumulativeGpa,
    majorGpa,
    majorCredits,
    generalCredits,
    otherCredits,
  };
};

// Category credit breakdown helper
export const getCategoryStats = (courses: Course[]) => {
  const res: Record<CourseCategory, { credits: number; count: number }> = {
    major_required: { credits: 0, count: 0 },
    major_elective: { credits: 0, count: 0 },
    general_required: { credits: 0, count: 0 },
    general_elective: { credits: 0, count: 0 },
    general_other: { credits: 0, count: 0 },
  };

  courses.forEach(c => {
    if (res[c.category]) {
      res[c.category].credits += c.credits;
      res[c.category].count += 1;
    }
  });

  return res;
};

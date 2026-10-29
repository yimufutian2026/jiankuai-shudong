/**
 * localStorage 工具 - 本地存储测评历史与咨询记录
 * 所有数据仅保存在用户浏览器本地，不上传服务器
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRecord {
  id: string;
  expertId: string;
  expertName: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AssessmentRecord {
  id: string;
  type: string;
  title: string;
  answers: Record<string, number>;
  totalScore: number;
  result: string;
  suggestion: string;
  recommendedExpert: string;
  crisisTriggered: boolean;
  createdAt: number;
}

export interface AppointmentRecord {
  id: string;
  preferredTime: string;
  consultationType: string;
  description: string;
  contactName: string;
  contactPhone: string;
  createdAt: number;
}

const KEYS = {
  CHAT_RECORDS: 'jiankuai_chat_records',
  ASSESSMENT_RECORDS: 'jiankuai_assessment_records',
  APPOINTMENT_RECORDS: 'jiankuai_appointment_records',
  DISCLAIMER_AGREED: 'jiankuai_disclaimer_agreed',
};

function safeGet<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function safeSet<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn('localStorage 写入失败');
  }
}

// Chat Records
export function getChatRecords(): ChatRecord[] {
  return safeGet<ChatRecord>(KEYS.CHAT_RECORDS);
}

export function saveChatRecord(record: ChatRecord): void {
  const records = getChatRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.unshift(record);
  }
  safeSet(KEYS.CHAT_RECORDS, records);
}

export function deleteChatRecord(id: string): void {
  const records = getChatRecords().filter((r) => r.id !== id);
  safeSet(KEYS.CHAT_RECORDS, records);
}

// Assessment Records
export function getAssessmentRecords(): AssessmentRecord[] {
  return safeGet<AssessmentRecord>(KEYS.ASSESSMENT_RECORDS);
}

export function saveAssessmentRecord(record: AssessmentRecord): void {
  const records = getAssessmentRecords();
  records.unshift(record);
  safeSet(KEYS.ASSESSMENT_RECORDS, records);
}

// Appointment Records
export function getAppointmentRecords(): AppointmentRecord[] {
  return safeGet<AppointmentRecord>(KEYS.APPOINTMENT_RECORDS);
}

export function saveAppointmentRecord(record: AppointmentRecord): void {
  const records = getAppointmentRecords();
  records.unshift(record);
  safeSet(KEYS.APPOINTMENT_RECORDS, records);
}

// Disclaimer
export function isDisclaimerAgreed(): boolean {
  try {
    return localStorage.getItem(KEYS.DISCLAIMER_AGREED) === 'true';
  } catch {
    return false;
  }
}

export function setDisclaimerAgreed(): void {
  try {
    localStorage.setItem(KEYS.DISCLAIMER_AGREED, 'true');
  } catch {
    console.warn('localStorage 写入失败');
  }
}

// Clear all
export function clearAllRecords(): void {
  try {
    Object.values(KEYS).forEach((key) => {
      if (key !== KEYS.DISCLAIMER_AGREED) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    console.warn('localStorage 清除失败');
  }
}

// Export all records as JSON
export function exportAllRecords(): string {
  const data = {
    chatRecords: getChatRecords(),
    assessmentRecords: getAssessmentRecords(),
    appointmentRecords: getAppointmentRecords(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

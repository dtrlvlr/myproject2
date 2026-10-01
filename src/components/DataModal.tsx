import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { X, Download, Upload, RefreshCw, UserCheck, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
  onExportExcel?: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onExportData,
  onImportData,
  onResetData,
  onExportExcel,
}) => {
  const [formProfile, setFormProfile] = useState<StudentProfile>(profile);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formProfile);
    onClose();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportError(null);
      try {
        onImportData(file);
      } catch (err: any) {
        setImportError('파일을 읽는 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            학생 정보 및 데이터 백업 관리
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 mt-4">
          {/* Student Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>학생 기본 정보</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={formProfile.name}
                  onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  대학교
                </label>
                <input
                  type="text"
                  value={formProfile.university}
                  onChange={(e) => setFormProfile({ ...formProfile, university: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  학과 / 전공
                </label>
                <input
                  type="text"
                  value={formProfile.major}
                  onChange={(e) => setFormProfile({ ...formProfile, major: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  학번
                </label>
                <input
                  type="text"
                  value={formProfile.studentId}
                  onChange={(e) => setFormProfile({ ...formProfile, studentId: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-colors"
              >
                학생 정보 저장
              </button>
            </div>
          </form>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">
              데이터 백업 및 엑셀 저장
            </h4>
            <p className="text-xs text-slate-500">
              시간표와 모든 과제, 성적 기록은 브라우저(LocalStorage)에 안전하게 저장됩니다. 엑셀 파일(.xlsx)로 내려받거나 JSON 파일로 백업할 수 있습니다.
            </p>

            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>시간표·과제·성적 전체 엑셀(.xlsx) 파일 다운로드</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>JSON 백업 파일</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>JSON 백업 복원</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {importError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{importError}</span>
              </p>
            )}
          </div>

          {/* Reset to Sample Demo Data */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-rose-600">
              데이터 초기화
            </h4>
            <div className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <div>
                <p className="text-xs font-medium text-rose-900">
                  기본 샘플 데이터로 복원
                </p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  컴퓨터공학과 예시 시간표와 과제 세트로 재설정합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('기본 샘플 데이터로 복원하시겠습니까? 현재 입력된 데이터는 대체됩니다.')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
              >
                샘플 복원
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

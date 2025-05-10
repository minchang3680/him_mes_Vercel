// ✅ Client.tsx (진단 대시보드 클라이언트 컴포넌트)
'use client';

import { useEffect, useState } from 'react';
import './datepicker.css';

const faultTypeMap: Record<number, string> = {
  0: '정상',
  1: '질량 불균형',
  2: '지지 불량',
  3: '복합 불량',
};

const faultColorMap: Record<number, string> = {
  0: 'bg-emerald-50',
  1: 'bg-amber-50',
  2: 'bg-orange-50',
  3: 'bg-rose-50',
};

export default function DiagnosisDashboard() {
  const [data, setData] = useState([]);
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});
  const [machineFilter, setMachineFilter] = useState<string[]>(['g1', 'g2', 'g3', 'g4', 'g5']);
  const [faultFilter, setFaultFilter] = useState<number[]>([0, 1, 2, 3]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch('/api/vibration-diagnosis/grouped-recent')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((e) => console.error('API 불러오기 실패', e));
  }, []);

  const toggleMachine = (machine: string) => {
    setExpandedMachines((prev) => ({ ...prev, [machine]: !prev[machine] }));
  };

  const handleMachineToggle = (machine: string) => {
    setMachineFilter((prev) =>
      prev.includes(machine) ? prev.filter((m) => m !== machine) : [...prev, machine]
    );
  };

  const handleFaultToggle = (type: number) => {
    setFaultFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filterByDate = (row: any) => {
    const detected = new Date(row.detected_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || detected >= start) && (!end || detected <= end);
  };

  const grouped = data.reduce((acc: any, row: any) => {
    const m = row.machine_name;
    if (!acc[m]) acc[m] = [];
    acc[m].push(row);
    return acc;
  }, {});

  const flatRows = Object.entries(grouped)
    .filter(([m]) => machineFilter.includes(m))
    .flatMap(([machine, records]: [string, any[]]) => {
      const [latest, ...rest] = records.filter(filterByDate).filter((r) => faultFilter.includes(r.fault_type));
      const rows = [];
      if (latest) {
        rows.push({ ...latest, isLatest: true });
        if (expandedMachines[machine]) {
          rows.push(...rest.map((r) => ({ ...r, isLatest: false, isExpanded: true })));
        }
      }
      return rows;
    });

  return (
    <main className="p-8 text-[22px] font-[500] text-gray-800 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8 text-gray-900">🛠️ 진단 데이터 대시보드</h1>

      {/* 필터 UI */}
      <div className="border border-gray-300 rounded-xl p-6 mb-8 bg-white shadow-md space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="font-semibold">시작일:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-[24px] h-[80px] w-[260px] datepicker-large"
          />
          <label className="font-semibold">종료일:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-[24px] h-[80px] w-[260px] datepicker-large"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">기계 선택:</span>
          {['g1', 'g2', 'g3', 'g4', 'g5'].map((m) => (
            <button
              key={m}
              onClick={() => handleMachineToggle(m)}
              className={`px-4 py-2 rounded-lg shadow-sm transition ${
                machineFilter.includes(m) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">상태 유형 선택:</span>
          {[0, 1, 2, 3].map((t) => {
            const isActive = faultFilter.includes(t);
            const baseColor = t === 0 ? 'emerald' : t === 1 ? 'amber' : t === 2 ? 'orange' : 'rose';
            return (
              <button
                key={t}
                onClick={() => handleFaultToggle(t)}
                className={`px-4 py-2 rounded-lg shadow-sm transition font-semibold
                  ${isActive ? `bg-${baseColor}-500 text-white` : `bg-${baseColor}-100 text-${baseColor}-800`}
                `}
              >
                {faultTypeMap[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 통합 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-[3px] border-gray-800 text-[22px]">
          <thead className="bg-gray-200 border-b-[3px] border-gray-800">
            <tr>
              <th className="border-[3px] border-gray-800 p-4">기계명</th>
              <th className="border-[3px] border-gray-800 p-4">진단 시각</th>
              <th className="border-[3px] border-gray-800 p-4">상태</th>
              <th className="border-[3px] border-gray-800 p-4">상태 유형</th>
            </tr>
          </thead>
          <tbody>
            {flatRows.map((row, idx) => (
              <tr
                key={idx}
                className={
                  row.isExpanded
                    ? `${faultColorMap[row.fault_type]} border-b-[3px] border-t-[3px] border-cyan-700`
                    : `${faultColorMap[row.fault_type]} border-b-[2px] border-gray-800`
                }
              >
                <td
                  className="border-[3px] border-inherit p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => row.isLatest && toggleMachine(row.machine_name)}
                >
                  {row.machine_name} {row.isLatest && '▾'}
                </td>
                <td className="border-[3px] border-inherit p-4">{new Date(row.detected_at).toLocaleString()}</td>
                <td className="border-[3px] border-inherit p-4">{row.fault_type === 0 ? '정상' : '고장'}</td>
                <td className="border-[3px] border-inherit p-4">{faultTypeMap[row.fault_type]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

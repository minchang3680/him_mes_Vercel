'use client';

export const metadata = {
  title: '진동 데이터 테이블',
  description: '측정된 진동 데이터를 확인용 페이지입니다',
};

// @ts-nocheck
import { useEffect, useState } from 'react';

export default function VibrationTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState(0);
  const [machineFilter, setMachineFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => setLoadingTime(t => t + 1), 1000);

    fetch('/api/vibration-data/grouped-range?per_group_limit=1000')
      .then(res => res.json())
      .then(data => {
        console.log('서버 응답 데이터:', data);
        setData(data);
        setLoading(false);
        clearInterval(timer);
      })
      .catch(error => {
        console.error('데이터 불러오기 실패:', error);
        setLoading(false);
        clearInterval(timer);
      });

    return () => clearInterval(timer);
  }, []);

  const getRowColor = (row: any) => {
    if (row.machine_name.includes('g1')) return 'bg-green-100';
    if (row.machine_name.includes('g2')) return 'bg-blue-100';
    if (row.machine_name.includes('g3')) return 'bg-yellow-100';
    return '';
  };

  const uniqueMachines = Array.from(new Set(data.map((row: any) => row.machine_name)));
  const uniqueSensors = Array.from(new Set(data.map((row: any) => row.sensor_no)));

  const filteredData = data.filter((row: any) => {
    return (machineFilter === 'ALL' || row.machine_name === machineFilter) &&
           (sensorFilter === 'ALL' || row.sensor_no === sensorFilter);
  });

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">📋 진동 데이터 테이블 (최근 1000개)</h1>
        <p>🔄 데이터 불러오는 중입니다... ({loadingTime}초)</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 진동 데이터 테이블 (최근 1000개)</h1>

      {/* 🔵 필터 선택 */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2 font-semibold">기계명:</label>
          <select className="border p-2" value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            {uniqueMachines.map(machine => (
              <option key={machine} value={machine}>{machine}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">센서 번호:</label>
          <select className="border p-2" value={sensorFilter} onChange={(e) => setSensorFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            {uniqueSensors.map(sensor => (
              <option key={sensor} value={sensor}>{sensor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔵 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">기계명</th>
              <th className="border p-2">센서 번호</th>
              <th className="border p-2">수집 시각</th>
              <th className="border p-2">측정 시간</th>
              <th className="border p-2">정상</th>
              <th className="border p-2">질량 불균형</th>
              <th className="border p-2">지지 불량</th>
              <th className="border p-2">복합 고장</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row: any) => (
              <tr key={row.id} className={getRowColor(row)}>
                <td className="border p-2">{row.machine_name}</td>
                <td className="border p-2">{row.sensor_no}</td>
                <td className="border p-2">{new Date(row.collected_at).toLocaleString()}</td>
                <td className="border p-2">{row.measured_time.toFixed(2)}</td>
                <td className="border p-2">{row.normal.toFixed(3)}</td>
                <td className="border p-2">{row.unbalance.toFixed(3)}</td>
                <td className="border p-2">{row.looseness.toFixed(3)}</td>
                <td className="border p-2">{row.unbalance_looseness.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

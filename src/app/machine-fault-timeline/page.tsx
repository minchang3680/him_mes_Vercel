'use client';

import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  annotationPlugin
);

import { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

const faultTypeMap: Record<number, string> = {
  0: '정상',
  1: '질량 불균형',
  2: '지지 불량',
  3: '복합 불량',
};

const machineColors: string[] = [
  'rgba(52, 211, 153, 0.6)',
  'rgba(59, 130, 246, 0.6)',
  'rgba(251, 191, 36, 0.6)',
  'rgba(251, 146, 60, 0.6)',
  'rgba(244, 114, 182, 0.6)',
];

const bgRegions = [
  { y: 0, color: 'rgba(209, 250, 229, 0.4)', label: '정상' },
  { y: 1, color: 'rgba(254, 243, 199, 0.4)', label: '질량 불균형' },
  { y: 2, color: 'rgba(255, 237, 213, 0.4)', label: '지지 불량' },
  { y: 3, color: 'rgba(254, 205, 211, 0.4)', label: '복합 불량' },
];

interface DiagnosisRecord {
  machine_name: string;
  detected_at: string;
  fault_type: number;
}

export default function MachineFaultTimeline() {
  const [data, setData] = useState<DiagnosisRecord[]>([]);
  const [machines, setMachines] = useState<string[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetch('/api/vibration-diagnosis/grouped-recent')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const uniqueMachines = Array.from(new Set(json.map((item: DiagnosisRecord) => item.machine_name)));
        setMachines(uniqueMachines);
        setSelectedMachines(uniqueMachines);
      });
  }, []);

  const filtered = data.filter((d) => {
    const time = new Date(d.detected_at).getTime();
    const start = new Date(`${startDate}T00:00:00+09:00`).getTime(); // ✅ KST 시작
    const end = new Date(`${endDate}T23:59:59+09:00`).getTime();     // ✅ KST 종료
    return selectedMachines
      .map((m) => m.toLowerCase())
      .includes(d.machine_name.trim().toLowerCase()) &&
      time >= start && time <= end;
  });
    
  const machineGrouped = selectedMachines.map((machine, index) => {
    const lineColor = machineColors[index % machineColors.length];
    const strongColor = lineColor.replace('0.6', '1');
  
    const sortedItems = filtered
      .filter((d) => d.machine_name.trim().toLowerCase() === machine.trim().toLowerCase()) // ✅ 여기
      .sort((a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime());
  
    let prevType: number | null = null;
  
    const dataPoints = sortedItems.map((d, i) => {
      const y = d.fault_type;
      const isChanged = prevType !== y;
      prevType = y;
  
      return {
        x: d.detected_at,
        y: y,
        radius: 4,
        pointStyle: 'circle',
        backgroundColor: '#fff',
        borderColor: isChanged ? strongColor : lineColor,
        borderWidth: isChanged ? 3 : 1,
        hoverRadius: 8,
        hoverBorderWidth: 4,
        hoverBackgroundColor: '#fff',
        hitRadius: 10,
      };
    });
  
    return {
      label: machine,
      data: dataPoints,
      borderColor: lineColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      stepped: true,
      tension: 0,
    };
  });  

  const chartData: ChartData<'line'> = {
    datasets: machineGrouped,
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -0.5,
        max: 3.5,
        ticks: {
          callback: function (val) {
            return faultTypeMap[val as number];
          },
          stepSize: 1,
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: '상태 유형 (fault_type)',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          displayFormats: {
            hour: 'yyyy-MM-dd HH시',
            minute: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: '시간 (detected_at)',
          font: {
            size: 16,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const yVal = context.raw as any;
            const date = context.label;
            return `${context.dataset.label} @ ${date}: ${faultTypeMap[yVal.y]}`;
          },
        },
      },
      annotation: {
        annotations: bgRegions.map((region) => ({
          type: 'box',
          yMin: region.y - 0.5,
          yMax: region.y + 0.5,
          backgroundColor: region.color,
          borderWidth: 0,
          label: {
            display: true,
            content: region.label,
            position: {
              x: 'start',
              y: 'center',
            },
            font: {
              size: 14,
              weight: 'bold',
            },
            color: '#444',
            backgroundColor: 'rgba(255,255,255,0.8)',
          },
        })),
      },
    },
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">📉 고장 진단 시계열</h1>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label>시작일</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <label>종료일</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          {machines.map((m) => (
            <button
              key={m}
              onClick={() =>
                setSelectedMachines((prev) =>
                  prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                )
              }
              className={`px-3 py-1 rounded border shadow ${
                selectedMachines.includes(m) ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
  {machineGrouped.map((machineChart, idx) => (
    <div key={idx} className="h-[400px] bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">{machineChart.label} 진단 시계열</h2>
      <Line
        data={{ datasets: [machineChart] }}
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false }, // 🔕 한 기계라서 범례 제거
          },
        }}
      />
    </div>
  ))}
</div>

    </main>
  );
}

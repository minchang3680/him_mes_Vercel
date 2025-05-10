// src/app/diagnosis-dashboard/page.tsx
import { Metadata } from 'next';
import DiagnosisDashboard from './Client.jsx';

export const metadata: Metadata = {
  title: '진단 대시보드',
  description: '기계 상태 진단을 시각화한 대시보드입니다',
};

export default function Page() {
  return <DiagnosisDashboard />;
}

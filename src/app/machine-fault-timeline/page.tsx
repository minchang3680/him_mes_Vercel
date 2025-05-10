// src/app/machine-fault-timeline/page.tsx
import { Metadata } from 'next';
import MachineFaultTimelineClient from './Client';

export const metadata: Metadata = {
  title: '고장 진단 시계열',
  description: '기계별 고장 상태를 시간 순으로 분석하는 페이지입니다',
};

export default function Page() {
  return <MachineFaultTimelineClient />;
}

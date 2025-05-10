// src/app/vibration-table/page.tsx
import { Metadata } from 'next';
import VibrationTableClient from './Client';

export const metadata: Metadata = {
  title: '진동 데이터 테이블',
  description: '측정된 진동 데이터를 확인용 페이지입니다',
};

export default function Page() {
  return <VibrationTableClient />;
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'المخترز للحاويات | إدارة وتأجير الحاويات التجارية والأنقاض',
  description: 'المنصة الذكية لإدارة وتأجير الحاويات التجارية وعقود الأنقاض اليومية وتنبيهات الواتساب والمواقع الجغرافية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

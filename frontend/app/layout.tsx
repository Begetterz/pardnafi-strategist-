import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PardnaFi Strategist',
  description: 'BNB Chain strategy workspace for yield discovery, simulation, and inspection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

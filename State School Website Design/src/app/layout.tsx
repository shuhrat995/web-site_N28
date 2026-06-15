import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'State School Website',
  description: 'Official school platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pulse — Creator Analytics',
  description: 'Unified analytics across YouTube channels and web stores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg text-text antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

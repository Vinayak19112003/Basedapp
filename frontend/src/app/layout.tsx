import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PvP Battle Game - Base Chain',
  description: 'Fast-paced PvP battle game with Rock-Paper-Scissors-Lizard-Spock mechanics on Base',
  keywords: ['Base', 'crypto', 'PvP', 'battle', 'game', 'web3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

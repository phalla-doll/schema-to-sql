import type { Metadata } from 'next';
import { DM_Sans, Space_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    weight: ['400', '500', '600'],
});

const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    title: 'Schema-to-SQL AI',
    description: 'Turn database schema dumps into natural-language SQL queries using AI',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={dmSans.variable}>
            <body className={`${dmSans.variable} ${spaceMono.variable} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}

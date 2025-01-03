import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DM_Mono } from 'next/font/google';
import { Noto_Sans_SC } from 'next/font/google';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './globals.css';

const interFont = Inter({
	subsets: ['latin'],
	weight: ['300', '400', '500', '700'],
	variable: '--font-inter',
	display: 'swap',
});
const dmMonoFont = DM_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	variable: '--font-dm-mono',
});
const notoSansSCFont = Noto_Sans_SC({
	weight: ['300', '400', '500', '700'],
	variable: '--font-noto-sans-sc',
	display: 'swap',
	preload: false,
});

export const metadata: Metadata = {
	title: 'Hetu',
	description: 'Minecraft Account System',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${interFont.variable} ${dmMonoFont.variable} ${notoSansSCFont.variable}`}
		>
			<body>
				<Theme>{children}</Theme>
			</body>
		</html>
	);
}

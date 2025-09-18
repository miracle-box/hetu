import { randomUUID } from 'crypto';

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? randomUUID();

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@repo/ui'],
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: '**',
				port: '',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: '**',
				port: '',
				pathname: '**',
			},
		],
	},
	logging: {
		fetches: {
			fullUrl: process.env.NODE_ENV === 'development',
		},
	},
	output: 'standalone',
	// Embed random build id in public env
	env: {
		NEXT_PUBLIC_BUILD_ID: BUILD_ID,
	},
	async generateBuildId() {
		return BUILD_ID;
	},

	// Type checking and linting should be in individual tasks.
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;

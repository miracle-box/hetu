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
		],
	},
	logging: {
		fetches: {
			fullUrl: process.env.NODE_ENV === 'development',
		},
	},
	output: 'standalone',

	// Type checking and linting should be in individual tasks.
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;

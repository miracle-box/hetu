/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [JSON.parse(process.env.TEXTURE_STORE_CONFIG)],
	},
	logging: {
		fetches: {
			fullUrl: process.env.NODE_ENV === 'development',
		},
	},
};

export default nextConfig;

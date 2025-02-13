import { bunPluginPino } from 'bun-plugin-pino';

// [TODO] Compiling into binaries is not supported by the Bun.build API
// See: https://github.com/oven-sh/bun/issues/11895
await Bun.build({
	entrypoints: ['./src/index.ts'],
	target: 'bun',
	outdir: './dist',
	minify: {
		syntax: true,
		whitespace: true,
		identifiers: false,
	},
	sourcemap: 'linked',
	plugins: [
		// [FIXME] Windows build breaks
		// See: https://github.com/vktrl/bun-plugin-pino/issues/5
		bunPluginPino({
			transports: ['@repo/pino-pretty-transport'],
		}),
	],
});

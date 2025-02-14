import path from 'node:path';
import fs from 'node:fs/promises';
import { BunPlugin } from 'bun';
import { bunPluginPino } from 'bun-plugin-pino';

function bunPluginEmbedSharpNative(): BunPlugin {
	return {
		name: 'embed-sharp-native',
		async setup(build) {
			const green = (str: string) => `\u001b[32m${str}\u001b[0m`;

			// @ts-expect-error Sharp libvips module does not have type declarations.
			const libvipsModule = await import('sharp/lib/libvips.js').catch(() => {
				console.log(
					green('Sharp is not detected, skipping native module loader injection.'),
				);
			});
			if (!libvipsModule) return;

			const platform: string = libvipsModule.runtimePlatformArch();

			console.log(green('Bundling Sharp native modules...'));

			const sharpNativePath = Bun.resolveSync(
				`@img/sharp-${platform}/sharp.node`,
				import.meta.dir,
			);
			await Bun.build({
				entrypoints: [sharpNativePath],
				outdir: build.config.outdir,
				target: build.config.target,
				naming: build.config.naming,
				sourcemap: build.config.sourcemap,
				minify: build.config.minify,
			});

			// [TODO] Support targets other than bun in the future
			if (build.config.target !== 'bun')
				throw new Error(
					'Sharp native bundler plugin not supports targets other than bun yet.',
				);

			let injected = false;
			build.onLoad({ filter: /\/lib\/sharp.js$|\\lib\\sharp.js$/ }, async (args) => {
				if (injected) return;
				injected = true;

				const contents = (await Bun.file(args.path).text()).replace(
					'const paths = [',
					`const paths = [\n  Bun.resolveSync(\`./sharp-${platform}.js\`, import.meta.dir),\n`,
				);

				console.log(green('Sharp native module path injected.'));

				return { contents };
			});
		},
	};
}

// [TODO] Compiling into binaries is not supported by the Bun.build API
// See: https://github.com/oven-sh/bun/issues/11895
await Bun.build({
	entrypoints: ['./src/index.ts'],
	target: 'bun',
	outdir: './dist',
	// minify: {
	// 	syntax: true,
	// 	whitespace: true,
	// 	identifiers: false,
	// },
	sourcemap: 'linked',
	plugins: [
		bunPluginEmbedSharpNative(),
		// [FIXME] Windows build breaks
		// See: https://github.com/vktrl/bun-plugin-pino/issues/5
		bunPluginPino({
			transports: ['@repo/pino-pretty-transport'],
		}),
	],
});

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
			const libvipsHelper = await import('sharp/lib/libvips.js').catch(() => {
				console.log(
					green('Sharp is not detected, skipping native module loader injection.'),
				);
			});
			if (!libvipsHelper) return;
			const platform: string = libvipsHelper.runtimePlatformArch();

			console.log(green('Bundling Sharp native modules...'));

			// [TODO] Support targets other than bun in the future
			if (build.config.target !== 'bun')
				throw new Error(
					'Sharp native bundler plugin not supports targets other than bun yet.',
				);

			const sharpNativePath = Bun.resolveSync(
				`@img/sharp-${platform}/sharp.node`,
				import.meta.dir,
			);
			await Bun.build({
				entrypoints: [sharpNativePath],
				outdir: path.join(
					build.config.outdir ?? '',
					`/sharp_natives/sharp/sharp-${platform}`,
				),
				// [FIXME] default loader causes error: Can't find variable: __require
				loader: {
					'.node': 'file',
				},
				target: build.config.target,
				naming: build.config.naming,
				sourcemap: build.config.sourcemap,
				format: build.config.format,
				minify: build.config.minify,
			});

			// libvips is under @img/sharp-win32-{arch} on Windows
			const libvipsSrcDir = platform.startsWith('win32')
				? path.dirname(sharpNativePath)
				: path.dirname(
						Bun.resolveSync(`@img/sharp-libvips-${platform}/lib`, import.meta.dir),
					);
			const libvipsDestDir = platform.startsWith('win32')
				? path.join(build.config.outdir ?? '', `/sharp_natives/@img/sharp-${platform}/lib`)
				: path.join(
						build.config.outdir ?? '',
						`/sharp_natives/sharp-libvips-${platform}/lib`,
					);

			await fs.mkdir(libvipsDestDir, { recursive: true });
			await fs
				.readdir(libvipsSrcDir)
				.then((files) =>
					files
						.filter((file) => /^libvips.*\.(so|dll|dylib)/.test(file))
						.map((file) =>
							fs.copyFile(
								path.join(libvipsSrcDir, file),
								path.join(libvipsDestDir, file),
							),
						),
				)
				.then((tasks) => Promise.all(tasks));

			let injected = false;
			build.onLoad({ filter: /[/\\]lib[/\\]sharp.js$$/ }, async (args) => {
				if (injected) return;
				injected = true;

				const replacedLines = [
					"import path from 'node:path';",
					`const bundleDir = path.dirname(Bun.resolveSync(\`./sharp_natives/sharp/sharp-${platform}/sharp-${platform}.js\`, import.meta.dir));`,
					`const relativeFilePath = require(path.join(bundleDir, "sharp-${platform}.js")).default`,
					'const paths = [',
					'path.join(bundleDir, relativeFilePath),',
				];
				const contents = (await Bun.file(args.path).text()).replace(
					'const paths = [',
					replacedLines.join('\n'),
				);

				console.log(green('Sharp native module path injected.'));

				return { contents };
			});
		},
	};
}

await fs.rm('./dist', {
	recursive: true,
	force: true,
});

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
		bunPluginEmbedSharpNative(),
		bunPluginPino({
			transports: ['@repo/pino-pretty-transport'],
		}),
	],
});

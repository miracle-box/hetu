import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { main as generate } from './index';
import { logger } from './logger';

const BACKEND_SRC_DIR = resolve(import.meta.dir, '../../../apps/backend/src');
const WATCH_PATTERNS = [
	'**/*.dto.ts',
	'**/*.entities.ts',
	'shared/typing/utils.ts',
	'shared/middlewares/errors/errors.ts',
];

let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

function debounceGenerate() {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
	}
	debounceTimer = setTimeout(() => {
		try {
			generate();
		} catch (error) {
			logger.error('Generation failed', error);
		}
	}, DEBOUNCE_MS);
}

function watchDirectory(dir: string, recursive = true) {
	const watcher = watch(dir, { recursive }, (_eventType, filename) => {
		if (!filename) return;

		// Check if file matches our patterns
		const matches = WATCH_PATTERNS.some((pattern) => {
			const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
			return regex.test(filename);
		});

		if (matches) {
			logger.debug(`File changed: ${filename}`);
			debounceGenerate();
		}
	});

	watcher.on('error', (error) => {
		logger.error('Watch error', error);
	});

	return watcher;
}

// Initial generation
generate();

// Start watching
const watcher = watchDirectory(BACKEND_SRC_DIR);

// Handle cleanup on exit
process.on('SIGINT', () => {
	logger.info('Stopping watch mode...');
	watcher.close();
	process.exit(0);
});

process.on('SIGTERM', () => {
	logger.info('Stopping watch mode...');
	watcher.close();
	process.exit(0);
});

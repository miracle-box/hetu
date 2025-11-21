type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogStats {
	startTime: number;
	filesGenerated: number;
	errors: number;
	warnings: number;
}

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	gray: '\x1b[90m',
};

class Logger {
	private stats: LogStats = {
		startTime: Date.now(),
		filesGenerated: 0,
		errors: 0,
		warnings: 0,
	};

	private formatMessage(level: LogLevel, message: string): string {
		const prefix = '[api-client]';
		let coloredPrefix = prefix;

		switch (level) {
			case 'warn':
				coloredPrefix = `${colors.yellow}${prefix}${colors.reset}`;
				break;
			case 'error':
				coloredPrefix = `${colors.red}${prefix}${colors.reset}`;
				break;
			case 'debug':
				coloredPrefix = `${colors.gray}${prefix}${colors.reset}`;
				break;
			case 'info':
			default:
				// No color for info
				break;
		}

		return `${coloredPrefix} ${level}: ${message}`;
	}

	info(message: string): void {
		console.log(this.formatMessage('info', message));
	}

	warn(message: string): void {
		this.stats.warnings++;
		console.warn(this.formatMessage('warn', message));
	}

	error(message: string, error?: unknown): void {
		this.stats.errors++;
		console.error(this.formatMessage('error', message));
		if (error instanceof Error) {
			console.error(error.stack);
		} else if (error) {
			console.error(error);
		}
	}

	debug(message: string): void {
		if (process.env['DEBUG']) {
			console.log(this.formatMessage('debug', message));
		}
	}

	incrementFiles(count = 1): void {
		this.stats.filesGenerated += count;
	}

	printStats(): void {
		const endTime = Date.now();
		const duration = ((endTime - this.stats.startTime) / 1000).toFixed(2);

		this.info(`${this.stats.filesGenerated} files generated, ${duration} seconds elapsed.`);
	}

	reset(): void {
		this.stats = {
			startTime: Date.now(),
			filesGenerated: 0,
			errors: 0,
			warnings: 0,
		};
	}
}

export const logger = new Logger();

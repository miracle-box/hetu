import { Clap } from '@repo/miniclap';
import { Config, initConfig } from '#config';

const cli = new Clap()
	.command(
		'start',
		new Clap().option('config', {
			short: 'c',
			type: String,
		}),
	)
	.command(
		'migrate',
		new Clap().option('config', {
			short: 'c',
			type: String,
		}),
	);

const cliResult = cli.parse(process.argv.slice(2));

if (cliResult.start?.result) {
	initConfig(cliResult.start.result.options.config);

	const startApp = (await import('./app')).startApp;
	startApp(Config.app.listenTo);
}

if (cliResult.migrate?.result) {
	initConfig(cliResult.migrate.result.options.config);

	const runMigration = (await import('./migrate')).runMigration;
	await runMigration(Config.database.migrationUrl);
}

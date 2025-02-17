import nodemailer from 'nodemailer';
import { Config } from '~backend/shared/config';

export const mailer = nodemailer.createTransport({
	host: Config.mailing.smtp.host,
	port: Config.mailing.smtp.port,
	secure: Config.mailing.smtp.secure,
	auth: {
		user: Config.mailing.smtp.user,
		pass: Config.mailing.smtp.password,
	},
});

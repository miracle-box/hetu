import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
	host: process.env.MAIL_SMTP_HOST,
	port: Number(process.env.MAIL_SMTP_PORT),
	secure: Boolean(process.env.MAIL_SMTP_SECURE),
	auth: {
		user: process.env.MAIL_SMTP_USER,
		pass: process.env.MAIL_SMTP_PASS,
	},
});

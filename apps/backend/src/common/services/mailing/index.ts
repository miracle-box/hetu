import type { Verification } from '#modules/auth/auth.entities';
import { BaseError } from '#common/errors/base.error';
import { Config } from '#config';
import { Logger } from '#shared/logger/index';
import { mailer } from '#shared/mailing/mailing';

/**
 * Error thrown when email sending fails
 */
export class MailingError extends BaseError {
	public override readonly cause?: unknown;
	override readonly name = 'MailingError';

	constructor(message: string, cause?: unknown) {
		super(message);
		this.cause = cause;
	}
}

/**
 * Mailing service to send emails.
 *
 * [FIXME] Ignore these magic values please, will refactor later.
 */
export abstract class MailingService {
	static async sendVerification(email: string, code: string, verif: Verification): Promise<void> {
		try {
			await mailer.sendMail({
				from: Config.mailing.smtp.sender,
				to: email,
				subject: 'Hetu Account Verification',
				text: `Your verification code for [${verif.scenario}] is: ${code}\nVerification ID: ${verif.id}`,
			});
		} catch (error) {
			Logger.error(
				{
					email,
					verificationId: verif.id,
					error,
				},
				'Failed to send verification email:',
			);

			// Throw a more specific error
			throw new MailingError(`Failed to send verification email to ${email}`, error);
		}
	}
}

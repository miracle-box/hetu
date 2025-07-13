import type { Verification } from '#modules/auth/auth.entities';
import { Config } from '#config';
import { mailer } from '#shared/mailing/mailing';

/**
 * Mailing service to send emails.
 *
 * [FIXME] Ignore these magic values please, will refactor later.
 */
export abstract class MailingService {
	static async sendVerification(email: string, code: string, verif: Verification): Promise<void> {
		await mailer.sendMail({
			from: Config.mailing.smtp.sender,
			to: email,
			subject: 'Hetu Account Verification',
			text: `Your verification code for [${verif.scenario}] is: ${code}\nVerification ID: ${verif.id}`,
		});
	}
}

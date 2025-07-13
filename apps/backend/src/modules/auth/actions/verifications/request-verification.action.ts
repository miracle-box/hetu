import { Left } from 'purify-ts';
import { VerificationScenario, VerificationType } from '#modules/auth/auth.entities';
import { InvalidVerificationScenarioError, InvalidVerificationTypeError } from '#modules/auth/auth.errors';
import { createEmailVerificationUsecase } from '#modules/auth/usecases/verifications/create-email-verification.usecase';
import { createOauth2VerificationUsecase } from '#modules/auth/usecases/verifications/create-oauth2-verification.usecase';

type Command = {
	type: VerificationType;
	scenario: VerificationScenario;
	target: string;
};

const emailAcceptableScenarios = [VerificationScenario.SIGNUP, VerificationScenario.PASSWORD_RESET];

const oauth2AcceptableScenarios = [
	VerificationScenario.OAUTH2_BIND,
	VerificationScenario.OAUTH2_SIGNIN,
] as const;

export async function requestVerificationAction(cmd: Command) {
	if (cmd.type === VerificationType.EMAIL) {
		if (
			!emailAcceptableScenarios.includes(
				cmd.scenario as (typeof emailAcceptableScenarios)[number],
			)
		) {
			return Left(
				new InvalidVerificationScenarioError(cmd.scenario, emailAcceptableScenarios),
			);
		}

		return (
			await createEmailVerificationUsecase({
				scenario: cmd.scenario as (typeof emailAcceptableScenarios)[number],
				email: cmd.target,
			})
		).map((data) => ({
			type: VerificationType.EMAIL,
			verification: data.verification,
		}));
	}

	if (cmd.type === VerificationType.OAUTH2) {
		if (
			!oauth2AcceptableScenarios.includes(
				cmd.scenario as (typeof oauth2AcceptableScenarios)[number],
			)
		) {
			return Left(
				new InvalidVerificationScenarioError(cmd.scenario, oauth2AcceptableScenarios),
			);
		}

		return (
			await createOauth2VerificationUsecase({
				scenario: cmd.scenario as (typeof oauth2AcceptableScenarios)[number],
				provider: cmd.target,
			})
		).map((data) => ({
			type: VerificationType.OAUTH2,
			verification: data.verification,
			challenge: data.challenge,
		}));
	}

	return Left(new InvalidVerificationTypeError(cmd.type));
}

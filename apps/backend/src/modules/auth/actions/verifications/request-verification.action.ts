import { Left } from 'purify-ts';
import { isValidEmail, isNonEmptyString } from '#common/utils/validation';
import { VerificationScenario, VerificationType } from '#modules/auth/auth.entities';
import {
	InvalidVerificationScenarioError,
	InvalidVerificationTargetError,
	InvalidVerificationTypeError,
} from '#modules/auth/auth.errors';
import { createEmailVerificationUsecase } from '#modules/auth/usecases/verifications/create-email-verification.usecase';
import { createMcClaimMsaVerificationUsecase } from '#modules/auth/usecases/verifications/create-mc-claim-msa-verification.usecase';
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
		// Validate email target
		if (!isValidEmail(cmd.target)) {
			return Left(new InvalidVerificationTargetError(cmd.target, VerificationType.EMAIL));
		}

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
		// Validate OAuth2 provider target
		if (!isNonEmptyString(cmd.target)) {
			return Left(new InvalidVerificationTargetError(cmd.target, VerificationType.OAUTH2));
		}

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

	if (cmd.type === VerificationType.MC_CLAIM_VERIFICATION_MSA) {
		// Only accepts mc_claim_verification scenario
		if (cmd.scenario !== VerificationScenario.MC_CLAIM_VERIFICATION) {
			return Left(
				new InvalidVerificationScenarioError(cmd.scenario, [
					VerificationScenario.MC_CLAIM_VERIFICATION,
				] as const),
			);
		}

		return (await createMcClaimMsaVerificationUsecase()).map((data) => ({
			type: VerificationType.MC_CLAIM_VERIFICATION_MSA,
			verification: data.verification,
			challenge: data.challenge,
		}));
	}

	return Left(new InvalidVerificationTypeError(cmd.type));
}

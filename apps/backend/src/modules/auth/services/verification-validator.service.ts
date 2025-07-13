import type { Verification } from '#modules/auth/auth.entities';
import { Left, Right } from 'purify-ts';
import {
	VerificationAlreadyVerifiedError,
	VerificationExpiredError,
	VerificationNotExistsError,
} from '#modules/auth/auth.errors';

export class VerificationValidatorService {
	static validateExists(verif: Verification | null) {
		if (!verif) {
			return Left(new VerificationNotExistsError());
		}
		return Right(verif);
	}

	static validateNotExpired(verif: Verification) {
		if (verif.expiresAt < new Date()) {
			return Left(new VerificationExpiredError(verif.id));
		}
		return Right(verif);
	}

	static validateTriesLeft(verif: Verification) {
		if (verif.triesLeft <= 0) {
			return Left(new VerificationExpiredError(verif.id));
		}
		return Right(verif);
	}

	static validateNotVerified(verif: Verification) {
		if (verif.verified) {
			return Left(new VerificationAlreadyVerifiedError(verif.id));
		}
		return Right(verif);
	}

	static validateForInspect(verif: Verification | null) {
		return this.validateExists(verif)
			.chain((v) => this.validateNotExpired(v))
			.chain((v) => this.validateTriesLeft(v));
	}

	static validateForVerify(verif: Verification | null) {
		return this.validateForInspect(verif).chain((v) => this.validateNotVerified(v));
	}
}

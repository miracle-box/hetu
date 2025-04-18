import { Either, Left, Right } from 'purify-ts/Either';

/**
 * Convert `Either` class to a plain object, then you can return it in Server Actions.
 *
 * @param either Either class to be returned
 * @returns React serializable object
 */
export function eitherToResp<L, R>(either: Either<L, R>): { _: 'L'; _l: L } | { _: 'R'; _r: R } {
	if (either.isLeft())
		return {
			_: 'L',
			_l: either.extract(),
		};
	else
		return {
			_: 'R',
			// Type checked above.
			_r: either.extract() as R,
		};
}

/**
 * Convert a plain "Either" object to `Either` class, for handling the response from Server Actions.
 *
 * @param resp response to be converted
 * @returns Either class
 */
export function respToEither<L, R>(resp: { _: 'L'; _l: L } | { _: 'R'; _r: R }): Either<L, R> {
	if (resp._ === 'L') return Left(resp._l);
	else return Right(resp._r);
}

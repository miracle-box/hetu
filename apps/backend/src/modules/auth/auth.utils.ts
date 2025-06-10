import { randomInt } from 'crypto';

export function generateVerificationCode(length: number) {
	return randomInt(0, 10 ** length)
		.toString()
		.padStart(length, '0');
}

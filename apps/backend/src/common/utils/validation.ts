/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
	if (!email || typeof email !== 'string') {
		return false;
	}

	// Basic email regex pattern
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Check basic format
	if (!emailRegex.test(email)) {
		return false;
	}

	// Additional checks
	const trimmedEmail = email.trim();

	// Check length constraints
	if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
		return false;
	}

	// Check for consecutive dots
	if (trimmedEmail.includes('..')) {
		return false;
	}

	// Check local part length (before @)
	const [localPart, domainPart] = trimmedEmail.split('@');
	if (!localPart || !domainPart || localPart.length > 64 || domainPart.length > 253) {
		return false;
	}

	return true;
}

/**
 * Validates if a string is not empty or just whitespace
 * @param value - The string to validate
 * @returns true if valid, false otherwise
 */
export function isNonEmptyString(value: string): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

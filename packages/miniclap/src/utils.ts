export function isInvalidValue(value: unknown): boolean {
	return value === null || value === undefined || (typeof value === 'number' && isNaN(value));
}

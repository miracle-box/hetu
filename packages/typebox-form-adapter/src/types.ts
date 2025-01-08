import type { typeboxValidator } from './validator';

/**
 * Utility to define your Form type as `FormApi<FormData, TypeboxValidator>`
 */
export type TypeboxValidator = ReturnType<typeof typeboxValidator>;

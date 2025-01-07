import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { t } from 'elysia';

export const validateBodySchema = yggTokenSchema;
export const validateResponseSchema = t.Void();

// Authorization middlewares handles the token validation

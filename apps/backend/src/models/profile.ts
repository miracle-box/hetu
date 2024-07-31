import { createSelectSchema } from 'drizzle-typebox';
import { Static } from 'elysia';
import { profileTable } from '~/db/schema/profile';

export const profileSchema = createSelectSchema(profileTable);

export type Profile = Static<typeof profileSchema>;

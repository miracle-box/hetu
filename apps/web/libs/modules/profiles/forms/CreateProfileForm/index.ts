import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { createProfileFormOpts } from './schema';
import { CreateProfileFormView } from './view';

export const useCreateProfileForm = createAppFormHook(createProfileFormOpts, CreateProfileFormView);

export type { CreateProfileFormValues } from './schema';

import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { createTextureFormOpts } from './schema';
import { CreateTextureFormView } from './view';

export const useCreateTextureForm = createAppFormHook(createTextureFormOpts, CreateTextureFormView);

export type { CreateTextureFormValues } from './schema';

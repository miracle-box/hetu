import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { newPasswordFormOpts } from './schema';
import { NewPasswordFormView } from './view';

export const useNewPasswordForm = createAppFormHook(newPasswordFormOpts, NewPasswordFormView);

export type { NewPasswordFormValues } from './schema';

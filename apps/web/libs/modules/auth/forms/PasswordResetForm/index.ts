import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { passwordResetFormOpts } from './schema';
import { PasswordResetFormView } from './view';

export const usePasswordResetForm = createAppFormHook(passwordResetFormOpts, PasswordResetFormView);

export type { PasswordResetFormValues } from './schema';

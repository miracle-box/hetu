import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { signupFormOpts } from './schema';
import { SignupFormView } from './view';

export const useSignupForm = createAppFormHook(signupFormOpts, SignupFormView);

export type { SignupFormValues } from './schema';

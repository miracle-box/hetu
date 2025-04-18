import { createAppFormHook } from '@repo/ui/hooks/use-app-form';
import { signinFormOpts } from './schema';
import { SigninFormView } from './view';

export const useSigninForm = createAppFormHook(signinFormOpts, SigninFormView);

export type { SigninFormValues } from './schema';

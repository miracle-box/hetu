import { signinUsecase } from '#modules/auth/usecases/signin.usecase';

type Command = {
	email: string;
	password: string;
};

export const signinAction = (command: Command) => {
	return signinUsecase(command);
};

import { signupUsecase } from '../usecases/signup.usecase';

type Command = {
	name: string;
	email: string;
	password: string;
	verificationId: string;
};

export const signupAction = (command: Command) => {
	return signupUsecase(command);
};

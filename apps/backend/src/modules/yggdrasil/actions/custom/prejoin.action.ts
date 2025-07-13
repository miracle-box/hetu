import { EitherAsync } from 'purify-ts';
import { prejoinUsecase } from '#modules/yggdrasil/usecases/custom/prejoin.usecase';

type Command = {
	_: undefined;
};

export const prejoinAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() => prejoinUsecase(cmd)).run();
};

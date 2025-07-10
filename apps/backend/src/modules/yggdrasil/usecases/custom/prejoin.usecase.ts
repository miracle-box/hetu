import { Right } from 'purify-ts';

type Command = {
	_: undefined;
};

export async function prejoinUsecase(cmd: Command) {
	return Right({ cmd });
}

import { getUserMcClaims, getUserProfiles } from '~web/libs/actions/api';
import { respToEither } from '~web/libs/utils/resp';
import { McClaimsListClient } from './McClaimsListClient';

export default async function McClaimsList() {
	const [listResult, profilesResult] = await Promise.all([getUserMcClaims(), getUserProfiles()]);

	const profilesEither = respToEither(profilesResult);
	const profiles = profilesEither.isRight() ? profilesEither.extract().profiles : [];

	return <McClaimsListClient initialData={listResult} profiles={profiles} />;
}

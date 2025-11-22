import { getMyMcClaims, getMyProfiles } from '~web/libs/actions/api/me';
import { respToEither } from '~web/libs/api/resp';
import { McClaimsListClient } from './McClaimsListClient';

export default async function McClaimsList() {
	const [listResult, profilesResult] = await Promise.all([getMyMcClaims(), getMyProfiles()]);

	const profilesEither = respToEither(profilesResult);
	const profiles = profilesEither.isRight() ? profilesEither.extract().profiles : [];

	return <McClaimsListClient initialData={listResult} profiles={profiles} />;
}

import { getUserMcClaims, getUserProfiles } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/utils/resp';
import { McClaimsListClient } from './McClaimsListClient';

export default async function McClaimsList() {
	const [listResult, profilesResult] = await Promise.all([getUserMcClaims(), getUserProfiles()]);

	const serializedResult = eitherToResp(listResult);
	const profiles = profilesResult.isRight() ? profilesResult.extract().profiles : [];

	return <McClaimsListClient initialData={serializedResult} profiles={profiles} />;
}

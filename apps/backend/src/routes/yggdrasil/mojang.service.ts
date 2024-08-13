import { YggdrasilProfile } from './common';
import { CommonService } from './common.service';

export abstract class MojangApiService {
	static async getProfilesByNames(names: string[]): Promise<YggdrasilProfile[]> {
		// [TODO] Merge multiple SQL queries into one
		const profiles = await Promise.all(
			names.map((name) => CommonService.getProfileByName(name)),
		).then((profiles) => profiles.filter((profile) => !!profile));

		return profiles;
	}
}

import { Texture, TextureType } from '~/models/texture';
import { YggdrasilProfile } from './common';
import { CommonService } from './common.service';
import { UploadTextureBody } from './mojang';
import { ProfilesService } from '../profiles/profiles.service';
import { TexturesService } from '../textures/textures.service';

export abstract class MojangApiService {
	static async getProfilesByNames(names: string[]): Promise<YggdrasilProfile[]> {
		// [TODO] Merge multiple SQL queries into one
		const profiles = await Promise.all(
			names.map((name) => CommonService.getProfileByName(name)),
		).then((profiles) => profiles.filter((profile) => !!profile));

		return profiles;
	}

	static async uploadTexture(
		profileId: string,
		textureType: TextureType,
		file: File,
	): Promise<void> {
		const profile = await ProfilesService.getProfileById(profileId);
		if (!profile) throw new Error('Profile not found');

		const description = `Uploaded via Yggdrasil API on ${new Date().toISOString()}.\nOriginal file name: ${file.name}`;
		const texture = await TexturesService.createTexture(
			profile.authorId,
			{
				name: file.name,
				description,
				type: textureType,
				image: file,
			},
			true,
		);

		if (textureType === 'skin' || textureType === 'skin_slim')
			await ProfilesService.editProfile(profile.id, { skinTextureId: texture.id });

		if (textureType === 'cape')
			await ProfilesService.editProfile(profile.id, { capeTextureId: texture.id });
	}

	static async resetTexture(profileId: string, type: 'skin' | 'cape'): Promise<void> {
		if (type === 'skin') await ProfilesService.editProfile(profileId, { skinTextureId: null });
		if (type === 'cape') await ProfilesService.editProfile(profileId, { capeTextureId: null });
	}
}

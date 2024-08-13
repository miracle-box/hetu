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

	static async uploadTexture(id: string, textureType: TextureType, file: File): Promise<void> {
		const profile = await ProfilesService.getProfileById(id);
		if (!profile) throw new Error('Profile not found');

		const description = `Uploaded via Yggdrasil API on ${new Date().toISOString()}.\nOriginal file name: ${file.name}`;
		const texture = await TexturesService.createTexture(
			id,
			{
				name: file.name,
				description,
				type: textureType,
				image: file,
			},
			true,
		);
	}
}

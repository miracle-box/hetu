import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle } from '~backend/modules/auth/auth.entities';
import { FileType } from '~backend/modules/files/files.entities';
import { FileHashingService } from '~backend/modules/files/services/file-hashing.service';
import { uploadTextureUseCase } from '~backend/modules/files/usecases/upload-texture.usecase';
import { ProfilesRepository } from '~backend/modules/profiles/profiles.repository';
import { TextureImageService } from '~backend/modules/textures/services/texture-image.service';
import { TextureType } from '~backend/modules/textures/textures.entities';
import { TexturesRepository } from '~backend/modules/textures/textures.repository';
import { validateTokenUsecase } from '../../usecases/authserver/validate-token.usecase';
import { YggdrasilForbiddenError, YggdrasilProfileNotFoundError } from '../../yggdrasil.errors';

type Command = {
	accessToken: string;
	profileId: string;
	textureType: 'skin' | 'cape';
	model?: '' | 'slim';
	file: File;
};

export const uploadTextureAction = (cmd: Command) => {
	return EitherAsync.fromPromise(() =>
		validateTokenUsecase({
			accessToken: cmd.accessToken,
			allowedLifecycle: [SessionLifecycle.Active],
		}),
	)
		.chain(async (validationResult) => {
			const profileResult = await ProfilesRepository.findProfileById(cmd.profileId);
			return profileResult
				.chain((profile) => {
					if (!profile) {
						return Left(new YggdrasilProfileNotFoundError(cmd.profileId));
					}
					return Right(profile);
				})
				.chain((profile) => {
					if (profile.authorId !== validationResult.user.id) {
						return Left(new YggdrasilForbiddenError('Forbidden'));
					}
					return Right(profile);
				});
		})
		.chain(async (profile) => {
			const textureType: TextureType =
				cmd.textureType === 'cape'
					? TextureType.CAPE
					: cmd.model === 'slim'
						? TextureType.SKIN_SLIM
						: TextureType.SKIN;

			return EitherAsync.fromPromise(async () =>
				TextureImageService.normalizeImage(cmd.file, textureType),
			).chain(async (normalizedImage) => {
				const hash = FileHashingService.hashSha256(normalizedImage);
				return Right({ normalizedImage, hash, profile, textureType });
			});
		})
		.chain(async ({ normalizedImage, hash, profile, textureType }) => {
			const fileResult = await uploadTextureUseCase({
				image: normalizedImage,
				fileType:
					cmd.textureType === 'skin' ? FileType.TEXTURE_SKIN : FileType.TEXTURE_CAPE,
				hash,
			});
			return fileResult.map((file) => ({ file, profile, textureType }));
		})
		.chain(async ({ file, profile, textureType }) => {
			const existingTextureResult = await TexturesRepository.findUserTextureByHash(
				profile.authorId,
				textureType,
				file.hash,
			);
			return existingTextureResult.map((existingTexture) => ({
				file,
				profile,
				textureType,
				existingTexture,
			}));
		})
		.chain(async ({ file, profile, textureType, existingTexture }) => {
			if (existingTexture) {
				return Right({ profile, file, texture: existingTexture });
			}

			const createTextureResult = await TexturesRepository.createTexture({
				authorId: profile.authorId,
				name: cmd.file.name,
				hash: file.hash,
				type: textureType,
				description: 'Uploaded at ' + new Date().toISOString() + ' via Yggdrasil API.',
			});
			return createTextureResult.map((uploadedTexture) => ({
				profile,
				file,
				texture: uploadedTexture,
			}));
		})
		.chain(async ({ profile, file, texture }) => {
			const updateProfileResult = await ProfilesRepository.updateProfile(profile.id, {
				skinTextureId: texture.type === TextureType.SKIN ? texture.id : undefined,
				capeTextureId: texture.type === TextureType.CAPE ? texture.id : undefined,
			});
			return updateProfileResult.map(() => ({ profile, file, texture }));
		})
		.run();
};

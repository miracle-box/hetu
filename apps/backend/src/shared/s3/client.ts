import { S3Client } from '@aws-sdk/client-s3';
import { Config } from '~backend/shared/config';

export const s3 = new S3Client({
	region: 'auto',
	endpoint: Config.storage.s3.endpoint,
	credentials: {
		accessKeyId: Config.storage.s3.accessKey.id,
		secretAccessKey: Config.storage.s3.accessKey.secret,
	},
});

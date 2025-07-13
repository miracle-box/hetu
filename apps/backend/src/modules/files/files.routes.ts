import { Elysia } from 'elysia';
import { uploadFileHandler } from '#modules/files/webapis/upload-file.handler';

export const FilesRoutes = new Elysia({
	name: 'Routes.Files',
	prefix: '/files',
}).use(uploadFileHandler);

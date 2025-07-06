import { Elysia } from 'elysia';
import { uploadFileHandler } from './webapis/upload-file.handler';

export const FilesRoutes = new Elysia({
	name: 'Routes.Files',
	prefix: '/files',
}).use(uploadFileHandler);

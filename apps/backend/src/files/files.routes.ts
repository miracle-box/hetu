import { Elysia } from 'elysia';
import { uploadHandler } from './webapis/upload';

export const FilesRoutes = new Elysia({
	name: 'Routes.Files',
	prefix: '/files',
}).use(uploadHandler);

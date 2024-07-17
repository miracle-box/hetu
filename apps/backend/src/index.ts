import swagger from '@elysiajs/swagger';
import { AuthController } from './routes/auth/auth.controller';
import { Elysia } from 'elysia';

const app = new Elysia().use(swagger()).listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);

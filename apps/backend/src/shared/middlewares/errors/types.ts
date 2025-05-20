import type { StatusMap } from 'elysia';
import type { ElysiaCookie } from 'elysia/cookies';
import type { HTTPHeaders } from 'elysia/types';

export type ElysiaOnErrorContext = {
	error: unknown;
	code: string | number;
	body: unknown;
	request: Request;
	response: unknown;
	query: Record<string, string | undefined>;
	params: Record<string, string | undefined>;
	headers: Record<string, string | undefined>;
	cookie: Record<string, unknown>;
	route: string;
	path: string;
	set: {
		headers: HTTPHeaders;
		status?: number | keyof StatusMap;
		redirect?: string;
		cookie?: Record<string, ElysiaCookie>;
	};
	store: Record<string, unknown>;
};

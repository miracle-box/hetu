'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/api/response';
import { readSession } from '../auth';

export async function getOauth2Metadata() {
	return await handleResponse(api.auth.oauth2.metadata.get());
}

export async function requestVerification(body: API.Auth.RequestVerification.Body) {
	return await handleResponse(api.auth.verification.request.post(body));
}

export async function verifyVerification(body: API.Auth.VerifyVerification.Body) {
	return await handleResponse(api.auth.verification.verify.post(body));
}

export async function oauth2Signin(body: API.Auth.Oauth2Signin.Body) {
	return await handleResponse(api.auth.oauth2.signin.post(body));
}

export async function inspectOauth2Binding(params: API.Auth.CheckOauth2Binding.Param) {
	const session = await readSession();

	return await handleResponse(
		api.auth.oauth2.bind(params).check.post(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

export async function confirmOauth2Binding(params: API.Auth.ConfirmOauth2Binding.Param) {
	const session = await readSession();

	return await handleResponse(
		api.auth.oauth2.bind(params).confirm.post(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

export async function inspectVerification(params: API.Auth.InspectVerification.Param) {
	return await handleResponse(api.auth.verification(params).get());
}

export async function resetPassword(body: API.Auth.ResetPassword.Body) {
	return await handleResponse(api.auth['reset-password'].post(body));
}

export async function signin(body: API.Auth.Signin.Body) {
	return await handleResponse(api.auth.signin.post(body));
}

export async function signup(body: API.Auth.Signup.Body) {
	return await handleResponse(api.auth.signup.post(body));
}

export async function renewSession(authToken: string) {
	return await handleResponse(
		api.auth.validate.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		}),
	);
}

export async function refreshSession(authToken: string) {
	return await handleResponse(
		api.auth.sessions.refresh.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		}),
	);
}

export async function changePassword(body: API.Auth.ChangePassword.Body) {
	const session = await readSession();

	return await handleResponse(
		api.auth['change-password'].post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function listSessions() {
	const session = await readSession();

	return await handleResponse(
		api.auth.sessions.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function revokeAllSessions() {
	const session = await readSession();

	return await handleResponse(
		api.auth.sessions.delete(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

export async function revokeSession(params: API.Auth.RevokeSession.Param) {
	const session = await readSession();

	return await handleResponse(
		api.auth.sessions(params).delete(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

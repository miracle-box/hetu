'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/utils/api-response';
import { readSession } from '../auth';

export async function getOauth2Metadata() {
	return handleResponse(api.auth.oauth2.metadata.get());
}

export async function requestVerification(body: API.Auth.RequestVerification.Body) {
	return handleResponse(api.auth.verification.request.post(body));
}

export async function verifyVerification(body: API.Auth.VerifyVerification.Body) {
	return handleResponse(api.auth.verification.verify.post(body));
}

export async function oauth2Signin(body: API.Auth.Oauth2Signin.Body) {
	return handleResponse(api.auth.oauth2.signin.post(body));
}

export async function inspectOauth2Binding(params: API.Auth.CheckOauth2Binding.Param) {
	const session = await readSession();

	return handleResponse(
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

	return handleResponse(
		api.auth.oauth2.bind(params).confirm.post(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

export async function inspectVerification(params: API.Auth.InspectVerification.Param) {
	return handleResponse(api.auth.verification(params).get());
}

export async function resetPassword(body: API.Auth.ResetPassword.Body) {
	return handleResponse(api.auth['reset-password'].post(body));
}

export async function signin(body: API.Auth.Signin.Body) {
	return handleResponse(api.auth.signin.post(body));
}

export async function signup(body: API.Auth.Signup.Body) {
	return handleResponse(api.auth.signup.post(body));
}

export async function renewSession(authToken: string) {
	return handleResponse(
		api.auth.validate.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		}),
	);
}

export async function refreshSession(authToken: string) {
	return handleResponse(
		api.auth.sessions.refresh.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		}),
	);
}

export async function changePassword(body: API.Auth.ChangePassword.Body) {
	const session = await readSession();

	return handleResponse(
		api.auth['change-password'].post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function listSessions() {
	const session = await readSession();

	return handleResponse(
		api.auth.sessions.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function revokeAllSessions() {
	const session = await readSession();

	return handleResponse(
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

	return handleResponse(
		api.auth.sessions(params).delete(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

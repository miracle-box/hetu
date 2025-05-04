import type { Static } from '@sinclair/typebox';
import { Type, FormatRegistry } from '@sinclair/typebox';

// [TODO] TypeBox and string formats should be in a individual package
if (!FormatRegistry.Has('email'))
	FormatRegistry.Set('email', (value) =>
		/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(
			value,
		),
	);

if (!FormatRegistry.Has('uri'))
	FormatRegistry.Set('uri', (value) =>
		/^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i.test(
			value,
		),
	);

export const configSchema = Type.Object({
	app: Type.Object({
		listenTo: Type.String(),

		baseUrl: Type.String({ format: 'uri' }),

		session: Type.Object({
			ttlMs: Type.Integer(),
			inactiveAfterMs: Type.Integer(),
			maxLifespanMs: Type.Integer(),
		}),

		oauth: Type.Object({
			providers: Type.Record(
				Type.String(),
				// [TODO] Add OIDC "protocol"
				Type.Object({
					protocol: Type.Literal('oauth2'),
					clientID: Type.String(),
					clientSecret: Type.String(),
					pkce: Type.Union([
						Type.Literal(false),
						Type.Literal('S256'),
						Type.Literal('plain'),
					]),
					scopes: Type.Array(Type.String()),
					endpoints: Type.Object({
						authorization: Type.String({ format: 'uri' }),
						token: Type.String({ format: 'uri' }),
						userinfo: Type.String({ format: 'uri' }),
					}),
					profileMap: Type.Object({
						id: Type.String(),
						email: Type.Union([Type.Literal(false), Type.String()]),
						username: Type.Union([Type.Literal(false), Type.String()]),
						avatarUrl: Type.Union([Type.Literal(false), Type.String()]),
						nickname: Type.Union([Type.Literal(false), Type.String()]),
					}),
				}),
			),
		}),

		yggdrasil: Type.Object({
			serverName: Type.String(),

			links: Type.Object({
				homepage: Type.String({
					format: 'uri',
				}),
				register: Type.String({
					format: 'uri',
				}),
			}),

			skinDomains: Type.Array(Type.String()),

			profileKeypair: Type.Object({
				private: Type.String(),
				public: Type.String(),
			}),
		}),
	}),

	debug: Type.Object({
		logRequests: Type.Boolean(),
		enableServerTiming: Type.Boolean(),
	}),

	database: Type.Object({
		url: Type.String({
			format: 'uri',
		}),
		migrationUrl: Type.String({
			format: 'uri',
		}),
	}),

	storage: Type.Object({
		s3: Type.Object({
			endpoint: Type.String({
				format: 'uri',
			}),
			publicRoot: Type.String({
				format: 'uri',
			}),
			bucket: Type.String(),
			prefix: Type.String(),
			accessKey: Type.Object({
				id: Type.String(),
				secret: Type.String(),
			}),
		}),
	}),

	mailing: Type.Object({
		smtp: Type.Object({
			host: Type.String(),
			port: Type.Number({
				minimum: 1,
				maximum: 65535,
			}),
			secure: Type.Boolean(),
			user: Type.String(),
			password: Type.String(),
			sender: Type.String(),
		}),
	}),

	logging: Type.Object({
		prettyPrint: Type.Object({
			enabled: Type.Boolean(),
			destination: Type.String(),
		}),
		file: Type.Object({
			enabled: Type.Boolean(),
			destination: Type.String(),
			append: Type.Boolean(),
		}),
	}),
});

export type Config = Static<typeof configSchema>;

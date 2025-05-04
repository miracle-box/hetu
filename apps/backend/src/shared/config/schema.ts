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
		listenTo: Type.String({
			description: 'http server options',
		}),

		baseUrl: Type.String({
			format: 'uri',
			description: 'application base URL',
		}),

		session: Type.Object({
			ttlMs: Type.Integer({
				description: 'session TTL in milliseconds',
			}),
			inactiveAfterMs: Type.Integer({
				description: 'session will be inactive after this time',
			}),
			maxLifespanMs: Type.Integer({
				description: 'session will be invalid after this time',
			}),
		}),

		oauth: Type.Object(
			{
				providers: Type.Record(
					Type.String(),
					// [TODO] Add OIDC "protocol"
					Type.Object({
						protocol: Type.Literal('oauth2', {
							description: 'use OAuth2 for this provider',
						}),
						clientID: Type.String({
							description: 'client ID obtained from the provider',
						}),
						clientSecret: Type.String({
							description: 'client secret obtained from the provider',
						}),
						pkce: Type.Union(
							[Type.Literal(false), Type.Literal('S256'), Type.Literal('plain')],
							{
								description: 'PKCE code challenge method',
							},
						),
						scopes: Type.Array(Type.String(), {
							description: 'scopes for this provider',
						}),
						endpoints: Type.Object({
							authorization: Type.String({
								description: 'authorization endpoint',
							}),
							token: Type.String({
								description: 'token endpoint',
							}),
							userinfo: Type.String({
								description: 'user info endpoint',
							}),
						}),
						profileMap: Type.Object({
							id: Type.String({
								description: 'path of id field in profile response',
							}),
						}),
					}),
				),
			},
			{
				description: 'OAuth client configuration',
			},
		),

		yggdrasil: Type.Object({
			serverName: Type.String({
				description: 'Yggdrasil server name',
			}),

			links: Type.Object({
				homepage: Type.String({
					format: 'uri',
					description: 'homepage URL',
				}),
				register: Type.String({
					format: 'uri',
					description: 'sign up URL',
				}),
			}),

			skinDomains: Type.Array(Type.String(), {
				description: 'allowed skin domains',
			}),

			profileKeypair: Type.Object({
				private: Type.String({
					description: 'private profile signing key',
				}),
				public: Type.String({
					description: 'public profile signing key',
				}),
			}),
		}),
	}),

	debug: Type.Object({
		logRequests: Type.Boolean({
			description: 'log HTTP requests',
		}),
		enableServerTiming: Type.Boolean({
			description: 'send Server Timing headers',
		}),
	}),

	database: Type.Object({
		url: Type.String({
			format: 'uri',
			description: 'database connection URL',
		}),
		migrationUrl: Type.String({
			format: 'uri',
			description: 'database migration URL',
		}),
	}),

	storage: Type.Object({
		s3: Type.Object({
			endpoint: Type.String({
				format: 'uri',
				description: 'S3 storage endpoint',
			}),
			publicRoot: Type.String({
				format: 'uri',
				description: 'public access root URL',
			}),
			bucket: Type.String({
				description: 'S3 bucket name',
			}),
			prefix: Type.String({
				description: 'storage path prefix',
			}),
			accessKey: Type.Object({
				id: Type.String({
					description: 'access key ID',
				}),
				secret: Type.String({
					description: 'access key secret',
				}),
			}),
		}),
	}),

	mailing: Type.Object({
		smtp: Type.Object({
			host: Type.String({
				description: 'SMTP server host',
			}),
			port: Type.Number({
				minimum: 1,
				maximum: 65535,
				description: 'SMTP server port',
			}),
			secure: Type.Boolean({
				description: 'use TLS encryption',
			}),
			user: Type.String({
				description: 'SMTP username',
			}),
			password: Type.String({
				description: 'SMTP password',
			}),
			sender: Type.String({
				description: 'email sender line',
			}),
		}),
	}),

	logging: Type.Object({
		prettyPrint: Type.Object({
			enabled: Type.Boolean({
				description: 'enable pretty-printed logs',
			}),
			destination: Type.String({
				description: 'destination for pretty-printed logs',
			}),
		}),
		file: Type.Object({
			enabled: Type.Boolean({
				description: 'enable logging to files',
			}),
			destination: Type.String({
				description: 'destination for file logs',
			}),
			append: Type.Boolean({
				description: 'open log files in appending mode',
			}),
		}),
	}),
});

export type Config = Static<typeof configSchema>;

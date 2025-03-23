import { InlineCode } from '@repo/ui/typography';
import { validateSession } from '~web/libs/actions/auth';
export async function SessionInfo() {
	const session = await validateSession();

	return (
		session && (
			<div>
				<div>
					<span>User ID: </span>
					<InlineCode>{session.userId}</InlineCode>
				</div>
				<div>
					<span>Auth token: </span>
					<InlineCode>{session.authToken}</InlineCode>
				</div>
			</div>
		)
	);
}

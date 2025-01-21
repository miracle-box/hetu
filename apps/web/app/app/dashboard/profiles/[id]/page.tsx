import { Callout, Container, Flex, Heading } from '@radix-ui/themes';
import { AppNav } from '~web/libs/basicui/AppNav';

export type Props = {
	params: Promise<{ id: string }>;
};

export default async function InspectProfile({ params }: Props) {
	const { id } = await params;

	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Profile: {id}</Heading>

				<AppNav />

				<Callout.Root>ID param: {id}</Callout.Root>
			</Flex>
		</Container>
	);
}

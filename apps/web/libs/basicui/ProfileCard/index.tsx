import { Badge, Box, Card, Code, DataList, Flex } from '@radix-ui/themes';

export type Props = {
	profile: {
		id: string;
		name: string;
		authorId: string;
		skinTextureId: string | null;
		capeTextureId: string | null;
		isPrimary: boolean;
	};
	children?: React.ReactNode;
};

export function ProfileCard({ profile, children }: Props) {
	return (
		<Card>
			<Flex direction="column" gap="4">
				<DataList.Root>
					<DataList.Item>
						<DataList.Label>Username</DataList.Label>
						<DataList.Value>{profile.name}</DataList.Value>
					</DataList.Item>
					<DataList.Item>
						<DataList.Label>UUID</DataList.Label>
						<DataList.Value>
							<Code>{profile.id}</Code>
						</DataList.Value>
					</DataList.Item>
					<DataList.Item>
						<DataList.Label>Primary Profile</DataList.Label>
						<DataList.Value>
							{profile.isPrimary ? (
								<Badge color="green">Primary</Badge>
							) : (
								<Badge color="gray">Not Primary</Badge>
							)}
						</DataList.Value>
					</DataList.Item>
					<DataList.Item>
						<DataList.Label>Skin</DataList.Label>
						<DataList.Value>
							{profile.skinTextureId ? (
								<Code>{profile.skinTextureId}</Code>
							) : (
								<Badge color="gray">No texture</Badge>
							)}
						</DataList.Value>
					</DataList.Item>
					<DataList.Item>
						<DataList.Label>Cape</DataList.Label>
						<DataList.Value>
							{profile.capeTextureId ? (
								<Code>{profile.capeTextureId}</Code>
							) : (
								<Badge color="gray">No texture</Badge>
							)}
						</DataList.Value>
					</DataList.Item>
				</DataList.Root>

				{children && <Box>{children}</Box>}
			</Flex>
		</Card>
	);
}

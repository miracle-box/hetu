import { Badge, Box, Card, Code, DataList } from '@radix-ui/themes';
import Image from 'next/image';

export type Props = {
	texture: {
		type: 'cape' | 'skin' | 'skin_slim';
		id: string;
		name: string;
		description: string;
		hash: string;
		authorId: string;
	};
};

export function TextureCard({ texture }: Props) {
	return (
		<Card>
			<DataList.Root>
				<DataList.Item>
					<DataList.Label>Name</DataList.Label>
					<DataList.Value>{texture.name}</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>Texture ID</DataList.Label>
					<DataList.Value>
						<Code>{texture.id}</Code>
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>Description</DataList.Label>
					<DataList.Value>{texture.description}</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>Type</DataList.Label>
					<DataList.Value>
						<Badge color="gray">
							{texture.type === 'skin'
								? 'Skin (Default)'
								: texture.type === 'skin_slim'
									? 'Skin (Slim)'
									: texture.type === 'cape'
										? 'Cape'
										: 'Unknown'}
						</Badge>
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>

			<Box position="relative" height="12rem" mt="4">
				<Image
					alt="Texture image"
					width={64}
					height={texture.type === 'cape' ? 32 : 64}
					src={`${process.env.TEXTURE_STORE_ROOT}/${texture.hash.slice(0, 2)}/${texture.hash}`}
					style={{
						imageRendering: 'pixelated',
						height: '12rem',
						width: 'auto',
					}}
					unoptimized
				/>
			</Box>
		</Card>
	);
}

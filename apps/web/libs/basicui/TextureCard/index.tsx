import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/card';
import { DataList, DataListItem, DataListLabel, DataListValue } from '@repo/ui/data-list';
import { InlineCode, Large } from '@repo/ui/typography';
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
			<CardHeader>
				<Large>{texture.name}</Large>
			</CardHeader>

			<CardContent>
				<DataList orientation="vertical" className="gap-2">
					<DataListItem>
						<DataListLabel>Texture ID</DataListLabel>
						<DataListValue>
							<InlineCode>{texture.id}</InlineCode>
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Description</DataListLabel>
						<DataListValue>{texture.description}</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Type</DataListLabel>
						<DataListValue>
							<Badge variant="secondary">
								{texture.type === 'skin'
									? 'Skin (Default)'
									: texture.type === 'skin_slim'
										? 'Skin (Slim)'
										: texture.type === 'cape'
											? 'Cape'
											: 'Unknown'}
							</Badge>
						</DataListValue>
					</DataListItem>
				</DataList>
			</CardContent>

			<CardFooter>
				<div className="relative h-48">
					<Image
						alt="Texture image"
						width={64}
						height={texture.type === 'cape' ? 32 : 64}
						src={`${process.env.TEXTURE_STORE_ROOT}/${texture.hash.slice(0, 2)}/${texture.hash}`}
						className=""
						style={{
							imageRendering: 'pixelated',
							height: '12rem',
							width: 'auto',
						}}
						unoptimized
					/>
				</div>
			</CardFooter>
		</Card>
	);
}

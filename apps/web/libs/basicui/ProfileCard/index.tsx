import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardHeader } from '@repo/ui/card';
import { DataList, DataListItem, DataListLabel, DataListValue } from '@repo/ui/data-list';
import { InlineCode, Large } from '@repo/ui/typography';

export type Props = {
	profile: {
		id: string;
		name: string;
		authorId: string;
		skinTextureId: string | null;
		capeTextureId: string | null;
		isPrimary: boolean;
	};
};

export function ProfileCard({ profile }: Props) {
	return (
		<Card>
			<CardHeader>
				<Large>{profile.name}</Large>
			</CardHeader>

			<CardContent>
				<DataList orientation="vertical" className="gap-2">
					<DataListItem>
						<DataListLabel>UUID</DataListLabel>
						<DataListValue>
							<InlineCode>{profile.id}</InlineCode>
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Primary Profile</DataListLabel>
						<DataListValue>
							{profile.isPrimary ? (
								<Badge variant="secondary">Primary</Badge>
							) : (
								<Badge variant="outline">Not primary</Badge>
							)}
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Skin</DataListLabel>
						<DataListValue>
							{profile.skinTextureId ? (
								<InlineCode>{profile.skinTextureId}</InlineCode>
							) : (
								<Badge variant="outline">No texture</Badge>
							)}
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Cape</DataListLabel>
						<DataListValue>
							{profile.capeTextureId ? (
								<InlineCode>{profile.capeTextureId}</InlineCode>
							) : (
								<Badge variant="outline">No texture</Badge>
							)}
						</DataListValue>
					</DataListItem>
				</DataList>
			</CardContent>
		</Card>
	);
}

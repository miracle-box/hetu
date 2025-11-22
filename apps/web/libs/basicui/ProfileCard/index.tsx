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
	t: (key: string) => string;
};

export function ProfileCard({ profile, t }: Props) {
	return (
		<Card>
			<CardHeader>
				<Large>{profile.name}</Large>
			</CardHeader>

			<CardContent>
				<DataList orientation="vertical" className="gap-2">
					<DataListItem>
						<DataListLabel>
							{t('dashboard.profiles.components.profileCard.uuid')}
						</DataListLabel>
						<DataListValue>
							<InlineCode>{profile.id}</InlineCode>
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>
							{t('dashboard.profiles.components.profileCard.primaryProfile')}
						</DataListLabel>
						<DataListValue>
							{profile.isPrimary ? (
								<Badge variant="secondary">{t('common.labels.primary')}</Badge>
							) : (
								<Badge variant="outline">{t('common.labels.notPrimary')}</Badge>
							)}
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>
							{t('dashboard.profiles.components.profileCard.skin')}
						</DataListLabel>
						<DataListValue>
							{profile.skinTextureId ? (
								<InlineCode>{profile.skinTextureId}</InlineCode>
							) : (
								<Badge variant="outline">{t('common.labels.noTexture')}</Badge>
							)}
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>
							{t('dashboard.profiles.components.profileCard.cape')}
						</DataListLabel>
						<DataListValue>
							{profile.capeTextureId ? (
								<InlineCode>{profile.capeTextureId}</InlineCode>
							) : (
								<Badge variant="outline">{t('common.labels.noTexture')}</Badge>
							)}
						</DataListValue>
					</DataListItem>
				</DataList>
			</CardContent>
		</Card>
	);
}

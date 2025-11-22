'use client';

import type { API } from '@repo/api-client';
import { Button } from '@repo/ui/button';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@repo/ui/dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@repo/ui/drawer';
import { useBreakpoint } from '@repo/ui/hooks/use-breakpoint';
import { useTranslations } from 'next-intl';

function ProfilesList({
	profiles,
	onSelect,
}: {
	profiles: API.Profiles.Entities.Profile[];
	onSelect: (profile: API.Profiles.Entities.Profile) => void;
}) {
	return (
		<div>
			{profiles.map((profile) => (
				<Button key={profile.id} variant="outline" onClick={() => onSelect(profile)}>
					{profile.name}
				</Button>
			))}
		</div>
	);
}

export type Props = {
	Trigger: React.ReactNode;
	profiles: API.Profiles.Entities.Profile[];
	onSelect: (profile: API.Profiles.Entities.Profile) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SelectProfileModalView({ Trigger, profiles, onSelect, open, onOpenChange }: Props) {
	const t = useTranslations();
	const widerThanSm = useBreakpoint('sm');

	return widerThanSm ? (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{Trigger}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t('dashboard.profiles.components.selectProfileModal.title')}
					</DialogTitle>
					<DialogDescription>
						{t('dashboard.profiles.components.selectProfileModal.description')}
					</DialogDescription>
				</DialogHeader>

				<ProfilesList profiles={profiles} onSelect={onSelect} />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('dashboard.profiles.components.selectProfileModal.cancel')}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer shouldScaleBackground open={open} onOpenChange={onOpenChange}>
			<DrawerTrigger asChild>{Trigger}</DrawerTrigger>
			<DrawerContent>
				{/* Scroll wrapper */}
				<div className="overflow-y-scroll">
					<DrawerHeader>
						<DrawerTitle>
							{t('dashboard.profiles.components.selectProfileModal.title')}
						</DrawerTitle>
						<DrawerDescription>
							{t(
								'dashboard.profiles.components.selectProfileModal.descriptionMobile',
							)}
						</DrawerDescription>
					</DrawerHeader>

					<div className="px-4">
						<ProfilesList profiles={profiles} onSelect={onSelect} />
					</div>

					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="secondary">
								{t('dashboard.profiles.components.selectProfileModal.cancel')}
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

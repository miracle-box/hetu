'use client';

import type { ProfilesEntities } from '@repo/api-client';
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

function ProfilesList({
	profiles,
	onSelect,
}: {
	profiles: ProfilesEntities.Profile[];
	onSelect: (profile: ProfilesEntities.Profile) => void;
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
	profiles: ProfilesEntities.Profile[];
	onSelect: (profile: ProfilesEntities.Profile) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SelectProfileModalView({ Trigger, profiles, onSelect, open, onOpenChange }: Props) {
	const widerThanSm = useBreakpoint('sm');

	return widerThanSm ? (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{Trigger}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Select profile</DialogTitle>
					<DialogDescription>Select a profile to use this texture on.</DialogDescription>
				</DialogHeader>

				<ProfilesList profiles={profiles} onSelect={onSelect} />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
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
						<DrawerTitle>Select profile</DrawerTitle>
						<DrawerDescription>
							Select a profile to use this texture for.
						</DrawerDescription>
					</DrawerHeader>

					<div className="px-4">
						<ProfilesList profiles={profiles} onSelect={onSelect} />
					</div>

					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="secondary">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

'use client';

import { Button } from '@repo/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@repo/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@repo/ui/drawer';
import { useBreakpoint } from '@repo/ui/hooks/use-breakpoint';
import { Icon } from '@repo/ui/icon';
import React from 'react';

export type Props = {
	Trigger: React.ReactNode;
	FormView: React.ComponentType;
	formId: string;
	canSubmit: boolean | undefined;
	isSubmitting: boolean | undefined;
};

export function CreateProfileModalView({
	Trigger,
	FormView,
	formId,
	canSubmit,
	isSubmitting,
}: Props) {
	const widerThanSm = useBreakpoint('sm');

	return widerThanSm ? (
		<Dialog>
			<DialogTrigger asChild>{Trigger}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create profile</DialogTitle>
					<DialogDescription>Your first profile is primary profile.</DialogDescription>
				</DialogHeader>

				<FormView />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>

					<Button type="submit" form={formId} disabled={!canSubmit}>
						{isSubmitting ? (
							<>
								<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Profile...
							</>
						) : (
							'Create Profile'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer shouldScaleBackground>
			<DrawerTrigger asChild>{Trigger}</DrawerTrigger>
			<DrawerContent>
				{/* Scroll wrapper */}
				<div className="overflow-y-scroll">
					<DrawerHeader>
						<DrawerTitle>Create profile</DrawerTitle>
						<DrawerDescription>
							Your first profile is primary profile.
						</DrawerDescription>
					</DrawerHeader>

					<div className="px-4">
						<FormView />
					</div>

					<DrawerFooter>
						<Button type="submit" form={formId} disabled={!canSubmit}>
							{isSubmitting ? (
								<>
									<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Profile...
								</>
							) : (
								'Create Profile'
							)}
						</Button>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

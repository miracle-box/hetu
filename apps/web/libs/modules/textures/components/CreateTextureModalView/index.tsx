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
import { useTranslations } from 'next-intl';
import React from 'react';

export type Props = {
	Trigger: React.ReactNode;
	FormView: React.ComponentType;
	formId: string;
	canSubmit: boolean | undefined;
	isSubmitting: boolean | undefined;
};

export function CreateTextureModalView({
	Trigger,
	FormView,
	formId,
	canSubmit,
	isSubmitting,
}: Props) {
	const t = useTranslations();
	const widerThanSm = useBreakpoint('sm');

	return widerThanSm ? (
		<Dialog>
			<DialogTrigger asChild>{Trigger}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t('dashboard.textures.components.createTextureModal.title')}
					</DialogTitle>
					<DialogDescription>
						{t('dashboard.textures.components.createTextureModal.description')}
					</DialogDescription>
				</DialogHeader>

				<FormView />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('dashboard.textures.components.createTextureModal.cancel')}
						</Button>
					</DialogClose>

					<Button type="submit" form={formId} disabled={!canSubmit}>
						{isSubmitting ? (
							<>
								<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t('dashboard.textures.components.createTextureModal.creating')}
							</>
						) : (
							t('dashboard.textures.components.createTextureModal.create')
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
						<DrawerTitle>
							{t('dashboard.textures.components.createTextureModal.title')}
						</DrawerTitle>
						<DrawerDescription>
							{t('dashboard.textures.components.createTextureModal.description')}
						</DrawerDescription>
					</DrawerHeader>

					<div className="px-4">
						<FormView />
					</div>

					<DrawerFooter>
						<Button size="lg" type="submit" form={formId} disabled={!canSubmit}>
							{isSubmitting ? (
								<>
									<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t('dashboard.textures.components.createTextureModal.creating')}
								</>
							) : (
								t('dashboard.textures.components.createTextureModal.create')
							)}
						</Button>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
